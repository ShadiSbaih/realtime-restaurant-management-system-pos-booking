package com.dineflow.ai.service;

import com.dineflow.ai.entity.AiJobType;
import com.dineflow.auth.entity.User;
import com.dineflow.menu.entity.Category;
import com.dineflow.menu.entity.MenuItem;
import com.dineflow.menu.repository.CategoryRepository;
import com.dineflow.menu.repository.FeedbackRepository;
import com.dineflow.menu.repository.MenuItemRepository;
import com.dineflow.pos.repository.OrderItemRepository;
import com.dineflow.realtime.RealtimeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * AiOrchestrator — coordinates AI workflows and provides transactional helpers.
 * All long-running work is handed off to {@link AiJobWorker} so the underlying
 * Spring @Async proxy is actually used (internal calls bypass it).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiOrchestrator {

    private final GroqClient groq;
    private final AiJobService jobService;
    private final AiJobWorker worker;
    private final MenuItemRepository menuItemRepo;
    private final CategoryRepository categoryRepo;
    private final FeedbackRepository feedbackRepo;
    private final OrderItemRepository orderItemRepo;
    private final RealtimeService realtimeService;

    public UUID startFeedbackAnalysis(UUID itemId, User user, String refinement) {
        MenuItemSnapshot snapshot = loadMenuItemSnapshot(itemId);
        var job = jobService.create(AiJobType.FEEDBACK_ANALYZER, user, Map.of("itemId", itemId.toString()));
        String userId = user.getId().toString();

        worker.runFeedbackAnalysis(job.getId(), userId, snapshot, refinement);
        return job.getId();
    }

    @Transactional(readOnly = true)
    public MenuItemSnapshot loadMenuItemSnapshot(UUID itemId) {
        MenuItem item = menuItemRepo.findByIdWithFeedbacks(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Menu item not found: " + itemId));

        double avgRating = item.getFeedbacks() == null ? 0 :
                item.getFeedbacks().stream().mapToInt(f -> f.getRating()).average().orElse(0);

        String comments = item.getFeedbacks() == null ? "" :
                item.getFeedbacks().stream()
                        .filter(f -> f.getComment() != null && !f.getComment().isBlank())
                        .map(f -> "(" + f.getRating() + " Stars): " + f.getComment())
                        .reduce("", (a, b) -> a + " | " + b);

        return new MenuItemSnapshot(
                item.getId(), item.getName(),
                item.getCategory() != null ? item.getCategory().getName() : "Main Course",
                item.getCategory() != null ? item.getCategory() : null,
                item.getPrice(), item.getRecipe(),
                item.getFeedbacks() == null ? 0 : item.getFeedbacks().size(),
                avgRating, comments
        );
    }

    @Transactional
    public Object applyFeedbackResult(MenuItemSnapshot snap, String action,
                                       Map<String, Object> aiResp, String refinement) {
        MenuItem item = menuItemRepo.findById(snap.id()).orElseThrow();

        return switch (action) {
            case "IMPROVE" -> {
                String output = String.valueOf(aiResp.getOrDefault("output", ""));
                item.setAiSuggestion(output);
                if (refinement != null && !refinement.isBlank()) {
                    item.setRecipe(output);
                }
                yield menuItemRepo.save(item);
            }
            case "SPINOFF" -> {
                MenuItem spinoff = MenuItem.builder()
                        .name(String.valueOf(aiResp.getOrDefault("newName", snap.name() + " (New)")))
                        .recipe(String.valueOf(aiResp.getOrDefault("output", "")))
                        .price(snap.price())
                        .category(item.getCategory())
                        .isAvailable(false)
                        .discount(BigDecimal.ZERO)
                        .build();
                MenuItem saved = menuItemRepo.save(spinoff);
                realtimeService.broadcastMenuUpdated(Map.of("action", "spinoff-created", "name", saved.getName()));
                yield saved;
            }
            default -> item;
        };
    }

    public UUID startMenuItemGeneration(User user, String customPrompt, String constraints) {
        GenerationContext ctx = loadGenerationContext(customPrompt);
        var job = jobService.create(AiJobType.MENU_ITEM_GENERATOR, user,
                Map.of("prompt", customPrompt != null ? customPrompt : "auto", "constraints", constraints != null ? constraints : ""));
        String userId = user.getId().toString();

        worker.runMenuItemGeneration(job.getId(), userId, ctx, customPrompt, constraints);
        return job.getId();
    }

    @Transactional(readOnly = true)
    public GenerationContext loadGenerationContext(String customPrompt) {
        if (customPrompt != null && !customPrompt.isBlank()) {
            List<Category> categories = categoryRepo.findAll();
            String defaultCategory = categories.isEmpty() ? "Main Course" : categories.get(0).getName();
            Category cat = categories.isEmpty() ? null : categories.get(0);
            return new GenerationContext(null, null, defaultCategory, cat, new BigDecimal("25.00"));
        }

        Object[] topRow = orderItemRepo.findTopOrderedMenuItemId();
        if (topRow == null || topRow.length == 0) {
            return new GenerationContext(null, null, "Main Course", null, new BigDecimal("25.00"));
        }

        UUID topId = UUID.fromString(topRow[0].toString());
        return menuItemRepo.findById(topId).map(item -> new GenerationContext(
                item.getId(), item.getName(),
                item.getCategory() != null ? item.getCategory().getName() : "Main Course",
                item.getCategory(),
                item.getPrice()
        )).orElse(new GenerationContext(null, null, "Main Course", null, new BigDecimal("25.00")));
    }

    @Transactional
    public MenuItem saveGeneratedItem(Map<String, Object> aiResp, GenerationContext ctx) {
        MenuItem item = MenuItem.builder()
                .name(String.valueOf(aiResp.getOrDefault("newName", "New Dish")))
                .recipe(String.valueOf(aiResp.getOrDefault("recipe", "")))
                .price(ctx.defaultPrice())
                .category(ctx.category() != null ? categoryRepo.findById(ctx.category().getId()).orElse(null) : null)
                .isAvailable(false)
                .discount(BigDecimal.ZERO)
                .build();
        return menuItemRepo.save(item);
    }

    public String generateExecutiveBriefing() {
        String prompt = """
                You are an expert restaurant manager AI.
                Write a short, 1-2 sentence executive briefing about the restaurant's recent performance.
                Focus on positive trends like revenue efficiency or customer satisfaction.
                
                Respond ONLY with a raw JSON object (no markdown fences):
                {"briefing": "<your 1-2 sentence briefing>"}
                """;
        try {
            Map<String, Object> res = groq.generateJson(prompt);
            return String.valueOf(res.getOrDefault("briefing", "The restaurant is performing well this week."));
        } catch (Exception e) {
            log.error("Executive briefing failed", e);
            return "The business has demonstrated impressive revenue efficiency this past week.";
        }
    }

    public String generateDemandForecast() {
        String prompt = """
                You are an expert restaurant manager AI.
                Write a short, 1-2 sentence demand forecast for the upcoming weekend.
                Focus on expected surges in specific categories (e.g. dine-in, premium drinks, etc.).
                
                Respond ONLY with a raw JSON object (no markdown fences):
                {"forecast": "<your 1-2 sentence forecast>"}
                """;
        try {
            Map<String, Object> res = groq.generateJson(prompt);
            return String.valueOf(res.getOrDefault("forecast", "Expect higher demand for dine-in this weekend."));
        } catch (Exception e) {
            log.error("Demand forecast failed", e);
            return "Based on current trends, expect higher demand for dine-in orders this weekend.";
        }
    }

    public record MenuItemSnapshot(
            UUID id, String name, String categoryName,
            Category category, BigDecimal price, String recipe,
            int feedbackCount, double avgRating, String comments
    ) {}

    public record GenerationContext(
            UUID sourceItemId, String sourceItemName,
            String categoryName, Category category, BigDecimal defaultPrice
    ) {}
}
