package com.dineflow.ai.service;

import com.dineflow.ai.dto.AiProgressEvent;
import com.dineflow.menu.entity.MenuItem;
import com.dineflow.realtime.RealtimeService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

/**
 * AiJobWorker — actually runs AI jobs on the configured thread pool.
 *
 * It is separated from {@link AiOrchestrator} so Spring's @Async proxy is
 * honored: orchestrator calls worker methods from another bean, which forces
 * execution onto {@code aiTaskExecutor} instead of the request thread.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AiJobWorker {

    private final GroqClient groq;
    private final AiJobService jobService;
    private final RealtimeService realtimeService;

    @Autowired
    private ObjectProvider<AiOrchestrator> orchestratorProvider;

    private AiOrchestrator orchestrator;

    @PostConstruct
    void init() {
        this.orchestrator = orchestratorProvider.getIfAvailable();
    }

    @Async("aiTaskExecutor")
    public void runFeedbackAnalysis(UUID jobId, String userId,
                                    AiOrchestrator.MenuItemSnapshot snap, String refinement) {
        try {
            jobService.markRunning(jobId);
            broadcast(jobId, userId, 10, "AI job started...");
            String prompt;

            if (refinement != null && !refinement.isBlank()) {
                broadcast(jobId, userId, 30, "Applying chef refinement: \"" + refinement + "\"...");
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
                    broadcastFailed(jobId, userId, "No customer feedback found for this item yet.");
                    return;
                }
                broadcast(jobId, userId, 40, "Analyzing " + snap.feedbackCount() + " customer reviews...");
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

            broadcast(jobId, userId, 65, "Asking AI to analyze your culinary data...");
            Map<String, Object> aiResp = groq.generateJson(prompt);
            String action = String.valueOf(aiResp.getOrDefault("action", "IGNORE"));

            broadcast(jobId, userId, 85, "Applying AI recommendations to the menu...");
            Object resultPayload = orchestrator.applyFeedbackResult(snap, action, aiResp, refinement);

            jobService.markDone(jobId, aiResp);
            broadcastDone(jobId, userId, resultPayload);

        } catch (Exception e) {
            log.error("Feedback analysis failed for item {}", snap.id(), e);
            jobService.markFailed(jobId, e.getMessage());
            broadcastFailed(jobId, userId, "Analysis failed: " + e.getMessage());
        }
    }

    @Async("aiTaskExecutor")
    public void runMenuItemGeneration(UUID jobId, String userId,
                                       AiOrchestrator.GenerationContext ctx,
                                       String customPrompt, String constraints) {
        try {
            jobService.markRunning(jobId);
            broadcast(jobId, userId, 10, "AI job started...");
            String prompt;

            if (customPrompt != null && !customPrompt.isBlank()) {
                broadcast(jobId, userId, 25, "Analyzing prompt: \"" + customPrompt + "\"...");
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
                    broadcastFailed(jobId, userId, "No orders found. Place some orders first.");
                    return;
                }
                broadcast(jobId, userId, 25, "Analyzing top-selling dish: " + ctx.sourceItemName() + "...");
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

            broadcast(jobId, userId, 60, "AI is crafting your dish concept...");
            Map<String, Object> aiResp = groq.generateJson(prompt);

            boolean isValid = parseBoolean(aiResp.getOrDefault("isValid", true));
            if (!isValid) {
                jobService.markFailed(jobId, "Item is a generic branded product — cannot generate spin-off.");
                broadcastFailed(jobId, userId, "The top-selling item is a branded product. Use a custom prompt instead.");
                return;
            }

            broadcast(jobId, userId, 85, "Saving draft to database for chef review...");
            MenuItem newItem = orchestrator.saveGeneratedItem(aiResp, ctx);

            realtimeService.broadcastMenuUpdated(Map.of("action", "new-item-generated", "name", newItem.getName()));
            jobService.markDone(jobId, Map.of("newItemId", newItem.getId().toString(), "newItemName", newItem.getName()));
            broadcastDone(jobId, userId, newItem);

        } catch (Exception e) {
            log.error("Menu item generation failed", e);
            jobService.markFailed(jobId, e.getMessage());
            broadcastFailed(jobId, userId, "Generation failed: " + e.getMessage());
        }
    }

    private void broadcast(UUID jobId, String userId, int progress, String message) {
        realtimeService.broadcastAiAction(userId,
                AiProgressEvent.running(jobId, progress, message));
    }

    private void broadcastDone(UUID jobId, String userId, Object result) {
        realtimeService.broadcastAiAction(userId,
                AiProgressEvent.completed(jobId, result));
    }

    private void broadcastFailed(UUID jobId, String userId, String message) {
        realtimeService.broadcastAiAction(userId,
                AiProgressEvent.failed(jobId, message));
    }

    private boolean parseBoolean(Object val) {
        if (val instanceof Boolean b) return b;
        if (val instanceof String s) return Boolean.parseBoolean(s);
        return true; // default optimistic
    }
}
