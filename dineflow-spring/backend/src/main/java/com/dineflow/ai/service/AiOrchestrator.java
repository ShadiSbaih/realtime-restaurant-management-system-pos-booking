package com.dineflow.ai.service;

import com.dineflow.ai.dto.AiProgressEvent;
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
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * AiOrchestrator — executes AI workflows asynchronously.
 *
 * Design rules:
 * 1. All @Async methods are NOT @Transactional at the method level.
 *    Database reads happen in @Transactional helper methods that load
 *    everything needed BEFORE the async thread starts.
 *    This prevents "EntityManager closed" errors in async threads.
 *
 * 2. AiJobService owns all DB writes (each committed in its own transaction).
 *
 * 3. Progress is broadcast via WebSocket STOMP — frontend listens on
 *    /topic/ai-jobs/{userId}.
 *
 * 4. GeminiClient handles JSON extraction robustly (strips markdown fences).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiOrchestrator {

    private final GeminiClient gemini;
    private final AiJobService jobService;
    private final MenuItemRepository menuItemRepo;
    private final CategoryRepository categoryRepo;
    private final FeedbackRepository feedbackRepo;
    private final OrderItemRepository orderItemRepo;
    private final RealtimeService realtimeService;

    // ─── Smart Menu: Feedback Analyzer ────────────────────────────────────────

    /**
     * Analyze customer feedback on a menu item.
     * Loads all necessary data in a transaction, then fires async.
     *
     * @param itemId     UUID of the menu item to analyze
     * @param user       The requesting user (for job ownership + WS routing)
     * @param refinement Optional free-text chef instruction to refine the dish
     */
    public UUID startFeedbackAnalysis(UUID itemId, User user, String refinement) {
        // Eagerly load everything we need inside a transaction
        MenuItemSnapshot snapshot = loadMenuItemSnapshot(itemId);
        var job = jobService.create(AiJobType.FEEDBACK_ANALYZER, user, Map.of("itemId", itemId.toString()));
        String userId = user.getId().toString();

        // Fire async — no more transaction boundary issues
        runFeedbackAnalysis(job.getId(), userId, snapshot, refinement);
        return job.getId();
    }

    @Transactional(readOnly = true)
    protected MenuItemSnapshot loadMenuItemSnapshot(UUID itemId) {
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

    @Async("aiTaskExecutor")
    protected void runFeedbackAnalysis(UUID jobId, String userId, MenuItemSnapshot snap, String refinement) {
        try {
            String prompt;

            if (refinement != null && !refinement.isBlank()) {
                // Mode: Chef real-time refinement
                broadcast(userId, 30, "Applying chef refinement: \"" + refinement + "\"...");
                prompt = """
                        You are an expert executive chef and restaurant consultant.
                        Menu Item: "%s" (Category: %s)
                        Current Recipe/Description: "%s"
                        
                        Chef instruction: "%s"
                        
                        Task: Rewrite the recipe to incorporate this instruction.
                        
                        Respond ONLY with a raw JSON object (no markdown fences):
                        {
                          "action": "IMPROVE",
                          "output": "<upgraded step-by-step recipe incorporating the refinement>"
                        }
                        """.formatted(snap.name(), snap.categoryName(),
                        snap.recipe() != null ? snap.recipe() : "Standard preparation.", refinement);
            } else {
                if (snap.feedbackCount() == 0) {
                    jobService.markFailed(jobId, "No feedback found for this item.");
                    broadcastFailed(userId, "No customer feedback found for this item yet.");
                    return;
                }
                broadcast(userId, 40, "Analyzing " + snap.feedbackCount() + " customer reviews...");
                prompt = """
                        You are an expert executive chef and restaurant consultant.
                        Menu Item: "%s" (Category: %s)
                        Average Rating: %.1f out of 5.
                        Recent Customer Comments: %s
                        
                        Rules:
                        - Rating >= 4.0 → create a NEW spin-off. Set "action" to "SPINOFF".
                        - Rating <= 3.5 → write an improvement plan. Set "action" to "IMPROVE".
                        - Not enough feedback → set "action" to "IGNORE".
                        
                        Respond ONLY with a raw JSON object (no markdown fences):
                        {
                          "action": "SPINOFF" | "IMPROVE" | "IGNORE",
                          "newName": "<spin-off dish name, only if SPINOFF>",
                          "output": "<recipe OR improvement plan>"
                        }
                        """.formatted(snap.name(), snap.categoryName(), snap.avgRating(),
                        snap.comments().isBlank() ? "No written comments." : snap.comments());
            }

            broadcast(userId, 65, "Asking Gemini to analyze your culinary data...");
            Map<String, Object> aiResp = gemini.generateJson(prompt);
            String action = String.valueOf(aiResp.getOrDefault("action", "IGNORE"));

            broadcast(userId, 85, "Applying AI recommendations to the menu...");
            Object resultPayload = applyFeedbackResult(snap, action, aiResp, refinement);

            jobService.markDone(jobId, aiResp);
            broadcastDone(userId, resultPayload);

        } catch (Exception e) {
            log.error("Feedback analysis failed for item {}", snap.id(), e);
            jobService.markFailed(jobId, e.getMessage());
            broadcastFailed(userId, "Analysis failed: " + e.getMessage());
        }
    }

    @Transactional
    protected Object applyFeedbackResult(MenuItemSnapshot snap, String action,
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

    // ─── Menu Item Generator ──────────────────────────────────────────────────

    /**
     * Generate a brand-new menu concept from a custom prompt or from top-selling data.
     */
    public UUID startMenuItemGeneration(User user, String customPrompt, String constraints) {
        GenerationContext ctx = loadGenerationContext(customPrompt);
        var job = jobService.create(AiJobType.MENU_ITEM_GENERATOR, user,
                Map.of("prompt", customPrompt != null ? customPrompt : "auto", "constraints", constraints != null ? constraints : ""));
        String userId = user.getId().toString();

        runMenuItemGeneration(job.getId(), userId, ctx, customPrompt, constraints);
        return job.getId();
    }

    @Transactional(readOnly = true)
    protected GenerationContext loadGenerationContext(String customPrompt) {
        if (customPrompt != null && !customPrompt.isBlank()) {
            // Custom prompt: just pick a default category
            List<Category> categories = categoryRepo.findAll();
            String defaultCategory = categories.isEmpty() ? "Main Course" : categories.get(0).getName();
            Category cat = categories.isEmpty() ? null : categories.get(0);
            return new GenerationContext(null, null, defaultCategory, cat, new BigDecimal("25.00"));
        }

        // Auto mode: find top-selling item
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

    @Async("aiTaskExecutor")
    protected void runMenuItemGeneration(UUID jobId, String userId,
                                          GenerationContext ctx, String customPrompt, String constraints) {
        try {
            String prompt;

            if (customPrompt != null && !customPrompt.isBlank()) {
                broadcast(userId, 25, "Analyzing prompt: \"" + customPrompt + "\"...");
                prompt = """
                        You are an expert executive chef in a high-end restaurant.
                        The chef has requested: "%s"
                        Dietary & Business Constraints: %s.
                        Default Category: %s.
                        
                        Invent a brand-new elevated restaurant-grade dish that satisfies these instructions.
                        
                        Respond ONLY with a raw JSON object (no markdown fences):
                        {
                          "isValid": true,
                          "newName": "<name of new dish>",
                          "recipe": "<professional step-by-step recipe in Markdown with ### Ingredients and ### Instructions>"
                        }
                        """.formatted(customPrompt,
                        constraints != null && !constraints.isBlank() ? constraints : "None",
                        ctx.categoryName());
            } else {
                if (ctx.sourceItemName() == null) {
                    jobService.markFailed(jobId, "No orders found yet to base generation on.");
                    broadcastFailed(userId, "No orders found. Place some orders first.");
                    return;
                }
                broadcast(userId, 25, "Analyzing top-selling dish: " + ctx.sourceItemName() + "...");
                prompt = """
                        You are an expert executive chef in a high-end restaurant.
                        Our best-selling item is "%s" (Category: %s).
                        
                        Task 1: If this is a generic branded product (like Coca-Cola, Sprite, Bottled Water), set "isValid" to false.
                        Task 2: Otherwise, invent a creative elevated spin-off of this dish for our menu.
                        
                        Respond ONLY with a raw JSON object (no markdown fences):
                        {
                          "isValid": true,
                          "newName": "<name of spin-off dish>",
                          "recipe": "<professional step-by-step recipe in Markdown with ### Ingredients and ### Instructions>"
                        }
                        """.formatted(ctx.sourceItemName(), ctx.categoryName());
            }

            broadcast(userId, 60, "Gemini is crafting your dish concept...");
            Map<String, Object> aiResp = gemini.generateJson(prompt);

            boolean isValid = parseBoolean(aiResp.getOrDefault("isValid", true));
            if (!isValid) {
                jobService.markFailed(jobId, "Item is a generic branded product — cannot generate spin-off.");
                broadcastFailed(userId, "The top-selling item is a branded product. Use a custom prompt instead.");
                return;
            }

            broadcast(userId, 85, "Saving draft to database for chef review...");
            MenuItem newItem = saveGeneratedItem(aiResp, ctx);

            realtimeService.broadcastMenuUpdated(Map.of("action", "new-item-generated", "name", newItem.getName()));
            jobService.markDone(jobId, Map.of("newItemId", newItem.getId().toString(), "newItemName", newItem.getName()));
            broadcastDone(userId, newItem);

        } catch (Exception e) {
            log.error("Menu item generation failed", e);
            jobService.markFailed(jobId, e.getMessage());
            broadcastFailed(userId, "Generation failed: " + e.getMessage());
        }
    }

    @Transactional
    protected MenuItem saveGeneratedItem(Map<String, Object> aiResp, GenerationContext ctx) {
        MenuItem item = MenuItem.builder()
                .name(String.valueOf(aiResp.getOrDefault("newName", "New Dish")))
                .recipe(String.valueOf(aiResp.getOrDefault("recipe", "")))
                .price(ctx.defaultPrice())
                .category(ctx.category() != null ? categoryRepo.findById(ctx.category().getId()).orElse(null) : null)
                .isAvailable(false) // Draft — requires chef review
                .discount(BigDecimal.ZERO)
                .build();
        return menuItemRepo.save(item);
    }

    // ─── Synchronous AI Insights (Dashboard) ─────────────────────────────────

    /**
     * Generate a 1-2 sentence executive briefing based on restaurant performance.
     * This is a fast synchronous call — no job tracking needed.
     */
    public String generateExecutiveBriefing() {
        String prompt = """
                You are an expert restaurant manager AI.
                Write a short, 1-2 sentence executive briefing about the restaurant's recent performance.
                Focus on positive trends like revenue efficiency or customer satisfaction.
                
                Respond ONLY with a raw JSON object (no markdown fences):
                {"briefing": "<your 1-2 sentence briefing>"}
                """;
        try {
            Map<String, Object> res = gemini.generateJson(prompt);
            return String.valueOf(res.getOrDefault("briefing", "The restaurant is performing well this week."));
        } catch (Exception e) {
            log.error("Executive briefing failed", e);
            return "The business has demonstrated impressive revenue efficiency this past week.";
        }
    }

    /**
     * Generate a short demand forecast for the upcoming weekend.
     */
    public String generateDemandForecast() {
        String prompt = """
                You are an expert restaurant manager AI.
                Write a short, 1-2 sentence demand forecast for the upcoming weekend.
                Focus on expected surges in specific categories (e.g. dine-in, premium drinks, etc.).
                
                Respond ONLY with a raw JSON object (no markdown fences):
                {"forecast": "<your 1-2 sentence forecast>"}
                """;
        try {
            Map<String, Object> res = gemini.generateJson(prompt);
            return String.valueOf(res.getOrDefault("forecast", "Expect higher demand for dine-in this weekend."));
        } catch (Exception e) {
            log.error("Demand forecast failed", e);
            return "Based on current trends, expect higher demand for dine-in orders this weekend.";
        }
    }

    // ─── WebSocket Broadcast Helpers ──────────────────────────────────────────

    private void broadcast(String userId, int progress, String message) {
        realtimeService.broadcastAiAction(userId,
                AiProgressEvent.running(progress, message));
    }

    private void broadcastDone(String userId, Object result) {
        realtimeService.broadcastAiAction(userId,
                AiProgressEvent.completed(result));
    }

    private void broadcastFailed(String userId, String message) {
        realtimeService.broadcastAiAction(userId,
                AiProgressEvent.failed(message));
    }

    // ─── Internal Value Objects ───────────────────────────────────────────────

    record MenuItemSnapshot(
            UUID id, String name, String categoryName,
            Category category, BigDecimal price, String recipe,
            int feedbackCount, double avgRating, String comments
    ) {}

    record GenerationContext(
            UUID sourceItemId, String sourceItemName,
            String categoryName, Category category, BigDecimal defaultPrice
    ) {}

    private boolean parseBoolean(Object val) {
        if (val instanceof Boolean b) return b;
        if (val instanceof String s) return Boolean.parseBoolean(s);
        return true; // default optimistic
    }
}
