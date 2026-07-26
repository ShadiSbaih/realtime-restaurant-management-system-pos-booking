package com.dineflow.ai.service;

import com.dineflow.ai.entity.*;
import com.dineflow.ai.repository.AiJobRepository;
import com.dineflow.auth.entity.User;
import com.dineflow.menu.entity.MenuItem;
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
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * AiService — Spring @Async replacement for Inngest background jobs.
 * Implements the same logic as backend/src/inngest/function.ts.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final GeminiClient geminiClient;
    private final AiJobRepository aiJobRepository;
    private final MenuItemRepository menuItemRepository;
    private final FeedbackRepository feedbackRepository;
    private final OrderItemRepository orderItemRepository;
    private final RealtimeService realtimeService;

    private void broadcastAction(String userId, String action) {
        realtimeService.broadcastAiAction(userId, Map.of("action", action));
    }

    // ========================================================================
    // SMART MENU: Feedback Analyzer (SPINOFF / IMPROVE / IGNORE)
    // Equivalent to aiMenuFeedbackAnalyzer in Inngest
    // ========================================================================
    @Async("aiTaskExecutor")
    @Transactional
    public CompletableFuture<Void> runSmartMenuFeedback(UUID itemId, String userId) {
        AiJob job = AiJob.builder()
                .type(AiJobType.FEEDBACK_ANALYZER)
                .status(AiJobStatus.RUNNING)
                .inputPayload("{\"itemId\":\"" + itemId + "\"}")
                .build();
        aiJobRepository.save(job);

        try {
            broadcastAction(userId, "Fetching recent feedback for the menu item...");

            MenuItem item = menuItemRepository.findByIdWithFeedbacks(itemId)
                    .orElseThrow(() -> new RuntimeException("Menu item not found"));

            if (item.getFeedbacks() == null || item.getFeedbacks().isEmpty()) {
                updateJob(job, AiJobStatus.FAILED, "No feedback found for this item.");
                broadcastAction(userId, "No feedback found.");
                return CompletableFuture.completedFuture(null);
            }

            double avgRating = item.getFeedbacks().stream()
                    .mapToInt(f -> f.getRating()).average().orElse(0);
            String comments = item.getFeedbacks().stream()
                    .map(f -> "(" + f.getRating() + " Stars): " + f.getComment())
                    .reduce("", (a, b) -> a + " | " + b);

            // Same prompt as the original Inngest function
            String prompt = """
                    You are an expert executive chef and restaurant consultant.
                    Menu Item: "%s" (Category: %s)
                    Average Rating: %.1f out of 5.
                    Recent Customer Comments: %s
                    
                    Task:
                    1. If the Average Rating is high (>= 4.0), create a NEW spin-off product based on what they liked. Set "action" to "SPINOFF".
                    2. If the Average Rating is low (<= 3.5), write an actionable improvement plan for the kitchen based on the complaints. Set "action" to "IMPROVE".
                    3. If there isn't enough meaningful feedback, set "action" to "IGNORE".
                    
                    Respond STRICTLY in JSON:
                    {
                      "action": "SPINOFF" | "IMPROVE" | "IGNORE",
                      "newName": "Name of spin-off dish (Only if SPINOFF)",
                      "output": "Recipe OR improvement plan"
                    }
                    """.formatted(item.getName(), item.getCategory().getName(), avgRating,
                    comments.isEmpty() ? "No written comments." : comments);

            broadcastAction(userId, "Analyzing customer feedback with AI...");
            Map<String, Object> aiResponse = geminiClient.generateJson(prompt);
            String action = (String) aiResponse.get("action");

            broadcastAction(userId, "Applying AI recommendations...");

            if ("IMPROVE".equals(action)) {
                item.setAiSuggestion((String) aiResponse.get("output"));
                menuItemRepository.save(item);
                broadcastAction(userId, "Applying improvement suggestions...");
            } else if ("SPINOFF".equals(action)) {
                MenuItem spinoff = MenuItem.builder()
                        .name((String) aiResponse.get("newName"))
                        .recipe((String) aiResponse.get("output"))
                        .price(item.getPrice())
                        .category(item.getCategory())
                        .isAvailable(false) // Draft mode
                        .discount(BigDecimal.ZERO)
                        .build();
                menuItemRepository.save(spinoff);
                broadcastAction(userId, "Creating new spin-off dish...");
                realtimeService.broadcastMenuUpdated(Map.of("action", "spinoff-created"));
            }

            realtimeService.broadcastMenuUpdated(Map.of("action", "ai-complete"));
            updateJob(job, AiJobStatus.DONE, aiResponse.toString());
            broadcastAction(userId, "Done processing AI recommendations.");

        } catch (Exception e) {
            log.error("AI feedback analysis failed for item {}", itemId, e);
            updateJob(job, AiJobStatus.FAILED, e.getMessage());
            broadcastAction(userId, "AI analysis failed.");
        }

        return CompletableFuture.completedFuture(null);
    }

    // ========================================================================
    // GENERATE MENU ITEM: From top-selling item
    // Equivalent to aiMenuItemGenerator in Inngest
    // ========================================================================
    @Async("aiTaskExecutor")
    @Transactional
    public CompletableFuture<Void> runGenerateMenuItem(String userId) {
        AiJob job = AiJob.builder()
                .type(AiJobType.MENU_ITEM_GENERATOR)
                .status(AiJobStatus.RUNNING)
                .inputPayload("{}")
                .build();
        aiJobRepository.save(job);

        try {
            broadcastAction(userId, "Finding top-selling menu item...");

            Object[] topItem = orderItemRepository.findTopOrderedMenuItemId();
            if (topItem == null || topItem.length == 0) {
                updateJob(job, AiJobStatus.DONE, "{\"message\":\"No orders found yet.\"}");
                broadcastAction(userId, "No orders found to base generation on.");
                return CompletableFuture.completedFuture(null);
            }

            UUID topMenuItemId = UUID.fromString(topItem[0].toString());
            MenuItem originalItem = menuItemRepository.findById(topMenuItemId)
                    .orElseThrow(() -> new RuntimeException("Original menu item not found"));

            broadcastAction(userId, "Fetching details of the top-selling item...");

            // Same prompt as the original
            String prompt = """
                    You are an expert executive chef in a high-end restaurant in Kenya.
                    Our current best-selling menu item is "%s" (Category: %s).
                    
                    Task 1: Determine if this item is a generic branded product (like "Coca-Cola", "Sprite", "Bottled Water"). If it is, we cannot make a recipe for it. Set "isValid" to false.
                    
                    Task 2: If it IS a valid food or craft beverage, invent a brand new, elevated, or creative spin-off version of this dish to add to our menu.
                    
                    Return the response STRICTLY as a JSON object with the following structure:
                    {
                      "isValid": boolean,
                      "newName": "The name of the new spin-off dish",
                      "recipe": "A professional, step-by-step restaurant-grade recipe formatted in Markdown (using ### Ingredients and ### Instructions)."
                    }
                    """.formatted(originalItem.getName(), originalItem.getCategory().getName());

            broadcastAction(userId, "Asking Gemini to invent a new spin-off recipe...");
            Map<String, Object> aiResponse = geminiClient.generateJson(prompt);

            Boolean isValid = (Boolean) aiResponse.get("isValid");
            if (Boolean.FALSE.equals(isValid)) {
                updateJob(job, AiJobStatus.DONE, "{\"message\":\"Item is a generic branded product, skipped.\"}");
                broadcastAction(userId, "Item is a branded product — skipped generation.");
                return CompletableFuture.completedFuture(null);
            }

            broadcastAction(userId, "Saving the new spin-off recipe to the database...");
            MenuItem newItem = MenuItem.builder()
                    .name((String) aiResponse.get("newName"))
                    .recipe((String) aiResponse.get("recipe"))
                    .price(originalItem.getPrice())
                    .category(originalItem.getCategory())
                    .isAvailable(false) // Draft mode
                    .discount(BigDecimal.ZERO)
                    .build();
            menuItemRepository.save(newItem);

            realtimeService.broadcastMenuUpdated(Map.of("action", "new-item-generated", "name", newItem.getName()));
            updateJob(job, AiJobStatus.DONE, "{\"newItemName\":\"" + newItem.getName() + "\"}");
            broadcastAction(userId, "All Done!");

        } catch (Exception e) {
            log.error("AI menu item generation failed", e);
            updateJob(job, AiJobStatus.FAILED, e.getMessage());
            broadcastAction(userId, "Failed to generate new menu item.");
        }

        return CompletableFuture.completedFuture(null);
    }

    public Optional<AiJob> getJobStatus(UUID jobId) {
        return aiJobRepository.findById(jobId);
    }

    private void updateJob(AiJob job, AiJobStatus status, String result) {
        job.setStatus(status);
        job.setResultPayload(result);
        job.setCompletedAt(Instant.now());
        aiJobRepository.save(job);
    }
}
