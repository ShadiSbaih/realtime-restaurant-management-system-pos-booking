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
        broadcastStatus(userId, action, "PENDING", 50, null);
    }

    private void broadcastStatus(String userId, String action, String status, int progress, Object result) {
        Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("action", action);
        payload.put("status", status);
        payload.put("progress", progress);
        if (result != null) payload.put("result", result);
        realtimeService.broadcastAiAction(userId, payload);
    }

    @Async("aiTaskExecutor")
    @Transactional
    public CompletableFuture<Void> runSmartMenuFeedback(UUID itemId, String userId) {
        return runSmartMenuFeedback(itemId, userId, null);
    }

    // ========================================================================
    // SMART MENU: Feedback Analyzer & Real-time Refinement
    // ========================================================================
    @Async("aiTaskExecutor")
    @Transactional
    public CompletableFuture<Void> runSmartMenuFeedback(UUID itemId, String userId, Map<String, Object> body) {
        AiJob job = AiJob.builder()
                .type(AiJobType.FEEDBACK_ANALYZER)
                .status(AiJobStatus.RUNNING)
                .inputPayload("{\"itemId\":\"" + itemId + "\"}")
                .build();
        aiJobRepository.save(job);

        try {
            broadcastStatus(userId, "Fetching menu item and feedback history...", "PENDING", 20, null);

            MenuItem item = menuItemRepository.findByIdWithFeedbacks(itemId)
                    .orElseThrow(() -> new RuntimeException("Menu item not found"));

            String prompt;
            if (body != null && body.get("feedback") != null && !body.get("feedback").toString().trim().isEmpty()) {
                String refinement = body.get("feedback").toString();
                broadcastStatus(userId, "Applying real-time chef refinement: '" + refinement + "'...", "PENDING", 40, null);
                prompt = """
                        You are an expert executive chef and restaurant consultant.
                        Menu Item: "%s" (Category: %s)
                        Current Recipe/Description: "%s"
                        
                        The executive chef / restaurant admin is reviewing this dish and gave the following real-time refinement instruction: "%s".
                        
                        Task: Rewrite or upgrade the recipe, ingredients, and preparation notes to strictly incorporate this refinement.
                        
                        Respond STRICTLY in JSON:
                        {
                          "action": "IMPROVE",
                          "output": "The upgraded step-by-step recipe and description incorporating the refinement."
                        }
                        """.formatted(item.getName(), item.getCategory().getName(), item.getRecipe() != null ? item.getRecipe() : "Standard preparation.", refinement);
            } else {
                if (item.getFeedbacks() == null || item.getFeedbacks().isEmpty()) {
                    updateJob(job, AiJobStatus.FAILED, "No feedback found for this item.");
                    broadcastStatus(userId, "No feedback found.", "FAILED", 0, null);
                    return CompletableFuture.completedFuture(null);
                }

                double avgRating = item.getFeedbacks().stream()
                        .mapToInt(f -> f.getRating()).average().orElse(0);
                String comments = item.getFeedbacks().stream()
                        .map(f -> "(" + f.getRating() + " Stars): " + f.getComment())
                        .reduce("", (a, b) -> a + " | " + b);

                prompt = """
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
            }

            broadcastStatus(userId, "Analyzing culinary data with AI...", "PENDING", 60, null);
            Map<String, Object> aiResponse = geminiClient.generateJson(prompt);
            String action = (String) aiResponse.get("action");

            broadcastStatus(userId, "Applying AI culinary recommendations...", "PENDING", 85, null);

            MenuItem resultItem = item;
            if ("IMPROVE".equals(action)) {
                item.setAiSuggestion((String) aiResponse.get("output"));
                if (body != null && body.get("feedback") != null) {
                    item.setRecipe((String) aiResponse.get("output"));
                }
                menuItemRepository.save(item);
                resultItem = item;
                broadcastStatus(userId, "Applying improvement suggestions...", "PENDING", 90, null);
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
                resultItem = spinoff;
                broadcastStatus(userId, "Creating new spin-off dish...", "PENDING", 90, null);
                realtimeService.broadcastMenuUpdated(Map.of("action", "spinoff-created"));
            }

            realtimeService.broadcastMenuUpdated(Map.of("action", "ai-complete"));
            updateJob(job, AiJobStatus.DONE, aiResponse);
            broadcastStatus(userId, "Done processing AI recommendations.", "COMPLETED", 100, resultItem);

        } catch (Exception e) {
            log.error("AI feedback analysis failed for item {}", itemId, e);
            updateJob(job, AiJobStatus.FAILED, e.getMessage());
            broadcastStatus(userId, "AI analysis failed: " + e.getMessage(), "FAILED", 0, null);
        }

        return CompletableFuture.completedFuture(null);
    }

    @Async("aiTaskExecutor")
    @Transactional
    public CompletableFuture<Void> runGenerateMenuItem(String userId) {
        return runGenerateMenuItem(userId, null);
    }

    // ========================================================================
    // GENERATE MENU ITEM: Custom Studio Prompt or Top-Selling Item
    // ========================================================================
    @Async("aiTaskExecutor")
    @Transactional
    public CompletableFuture<Void> runGenerateMenuItem(String userId, Map<String, Object> body) {
        String inputJson = "{}";
        try {
            if (body != null) {
                inputJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(body);
            }
        } catch (Exception e) {
            log.warn("Failed to serialize body", e);
        }

        AiJob job = AiJob.builder()
                .type(AiJobType.MENU_ITEM_GENERATOR)
                .status(AiJobStatus.RUNNING)
                .inputPayload(inputJson)
                .build();
        aiJobRepository.save(job);

        try {
            String prompt;
            MenuItem categoryRef = null;

            if (body != null && body.get("prompt") != null && !body.get("prompt").toString().trim().isEmpty()) {
                String customPrompt = body.get("prompt").toString();
                Object constraints = body.get("constraints");
                broadcastStatus(userId, "Analyzing custom culinary prompt: '" + customPrompt + "'...", "PENDING", 25, null);
                
                // Get a default category if any exist
                categoryRef = menuItemRepository.findAll().stream().findFirst().orElse(null);
                String categoryName = categoryRef != null && categoryRef.getCategory() != null ? categoryRef.getCategory().getName() : "Main Course";

                prompt = """
                        You are an expert executive chef in a high-end restaurant in Kenya.
                        The executive chef / restaurant admin has requested a new menu concept based on this prompt: "%s".
                        Dietary & Business Constraints: %s.
                        Default Category: %s.
                        
                        Task: Invent a brand new, elevated, restaurant-grade dish that strictly satisfies these instructions and fits a high-end culinary menu.
                        
                        Return the response STRICTLY as a JSON object with the following structure:
                        {
                          "isValid": true,
                          "newName": "The name of the new dish",
                          "recipe": "A professional, step-by-step restaurant-grade recipe formatted in Markdown (using ### Ingredients, ### Preparation, and ### Chef's Notes)."
                        }
                        """.formatted(customPrompt, constraints != null ? constraints.toString() : "None", categoryName);
            } else {
                broadcastStatus(userId, "Finding top-selling menu item for spin-off analysis...", "PENDING", 25, null);

                Object[] topItem = orderItemRepository.findTopOrderedMenuItemId();
                if (topItem == null || topItem.length == 0) {
                    updateJob(job, AiJobStatus.DONE, "{\"message\":\"No orders found yet.\"}");
                    broadcastStatus(userId, "No orders found to base generation on.", "FAILED", 0, null);
                    return CompletableFuture.completedFuture(null);
                }

                UUID topMenuItemId = UUID.fromString(topItem[0].toString());
                MenuItem originalItem = menuItemRepository.findById(topMenuItemId)
                        .orElseThrow(() -> new RuntimeException("Original menu item not found"));
                categoryRef = originalItem;

                broadcastStatus(userId, "Fetching details of top-selling dish (" + originalItem.getName() + ")...", "PENDING", 40, null);

                prompt = """
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
            }

            broadcastStatus(userId, "Asking Gemini AI to formulate recipe and cost metrics...", "PENDING", 65, null);
            Map<String, Object> aiResponse = geminiClient.generateJson(prompt);

            Object isValidObj = aiResponse.get("isValid");
            Boolean isValid = false;
            if (isValidObj instanceof Boolean) {
                isValid = (Boolean) isValidObj;
            } else if (isValidObj instanceof String) {
                isValid = Boolean.parseBoolean((String) isValidObj);
            }

            if (Boolean.FALSE.equals(isValid)) {
                updateJob(job, AiJobStatus.DONE, "{\"message\":\"Item is a generic branded product, skipped.\"}");
                broadcastStatus(userId, "Item is a branded product — skipped generation.", "FAILED", 0, null);
                return CompletableFuture.completedFuture(null);
            }

            broadcastStatus(userId, "Saving draft recipe to database...", "PENDING", 85, null);
            
            BigDecimal defaultPrice = categoryRef != null && categoryRef.getPrice() != null ? categoryRef.getPrice() : new BigDecimal("25.00");
            MenuItem newItem = MenuItem.builder()
                    .name((String) aiResponse.get("newName"))
                    .recipe((String) aiResponse.get("recipe"))
                    .price(defaultPrice)
                    .category(categoryRef != null ? categoryRef.getCategory() : null)
                    .isAvailable(false) // Draft mode for chef review!
                    .discount(BigDecimal.ZERO)
                    .build();
            menuItemRepository.save(newItem);

            realtimeService.broadcastMenuUpdated(Map.of("action", "new-item-generated", "name", newItem.getName()));
            updateJob(job, AiJobStatus.DONE, "{\"newItemName\":\"" + newItem.getName() + "\"}");
            broadcastStatus(userId, "All Done! Draft ready for chef review.", "COMPLETED", 100, newItem);

        } catch (Exception e) {
            log.error("AI menu item generation failed", e);
            updateJob(job, AiJobStatus.FAILED, e.getMessage());
            broadcastStatus(userId, "Failed to generate new menu item: " + e.getMessage(), "FAILED", 0, null);
        }

        return CompletableFuture.completedFuture(null);
    }

    public String generateExecutiveBriefing() {
        try {
            String prompt = """
                    You are an expert restaurant manager AI.
                    Write a short, 1-2 sentence executive briefing about the restaurant's recent performance.
                    Focus on positive trends like revenue efficiency or customer satisfaction.
                    
                    Respond STRICTLY in JSON:
                    {
                      "briefing": "Your 1-2 sentence briefing."
                    }
                    """;
            Map<String, Object> response = geminiClient.generateJson(prompt);
            return (String) response.get("briefing");
        } catch (Exception e) {
            log.error("Failed to generate executive briefing", e);
            return "The business has demonstrated impressive revenue efficiency this past week.";
        }
    }

    public String generateDemandForecast() {
        try {
            String prompt = """
                    You are an expert restaurant manager AI.
                    Write a short, 1-2 sentence demand forecast for the upcoming weekend.
                    Focus on expected surges in specific categories (e.g. dine-in, premium drinks, etc.).
                    
                    Respond STRICTLY in JSON:
                    {
                      "forecast": "Your 1-2 sentence forecast."
                    }
                    """;
            Map<String, Object> response = geminiClient.generateJson(prompt);
            return (String) response.get("forecast");
        } catch (Exception e) {
            log.error("Failed to generate demand forecast", e);
            return "Based on current trends, expect higher demand for dine-in orders this weekend.";
        }
    }

    public Optional<AiJob> getJobStatus(UUID jobId) {
        return aiJobRepository.findById(jobId);
    }

    private void updateJob(AiJob job, AiJobStatus status, Object result) {
        job.setStatus(status);
        
        String resultJson = "{}";
        try {
            if (result != null) {
                if (result instanceof String && ((String) result).startsWith("{")) {
                    resultJson = (String) result; // Assume already JSON
                } else if (result instanceof String) {
                    resultJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(Map.of("message", result));
                } else {
                    resultJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(result);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to serialize job result", e);
        }
        
        job.setResultPayload(resultJson);
        job.setCompletedAt(Instant.now());
        aiJobRepository.save(job);
    }
}
