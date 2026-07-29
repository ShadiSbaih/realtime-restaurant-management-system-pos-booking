package com.dineflow.ai.controller;

import com.dineflow.ai.dto.AiStartResponse;
import com.dineflow.ai.entity.AiJob;
import com.dineflow.ai.service.AiJobService;
import com.dineflow.ai.service.AiOrchestrator;
import com.dineflow.auth.entity.User;
import com.dineflow.dashboard.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * AiController — REST endpoints for AI features.
 *
 * All async endpoints immediately return a jobId so the client
 * can poll /api/ai/jobs/{jobId} as fallback if WebSocket is unavailable.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiOrchestrator orchestrator;
    private final AiJobService jobService;
    private final ActivityLogService activityLogService;

    /**
     * POST /api/ai/smart-menu
     * Analyze feedback or apply a chef refinement to a menu item.
     *
     * Body: { "itemId": "uuid", "refinement": "optional free text" }
     */
    @PostMapping("/smart-menu")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AiStartResponse> smartMenu(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user
    ) {
        UUID itemId = UUID.fromString(body.get("itemId").toString());
        String refinement = body.containsKey("refinement") ? body.get("refinement").toString() : null;

        UUID jobId = orchestrator.startFeedbackAnalysis(itemId, user, refinement);
        activityLogService.log(user, "AI_FEEDBACK", "AI feedback analysis started for item " + itemId);

        return ResponseEntity.accepted().body(new AiStartResponse(jobId, "Feedback analysis started"));
    }

    /**
     * POST /api/ai/generate-item
     * Generate a new menu concept from a custom prompt or from top-selling data.
     *
     * Body: { "prompt": "optional", "constraints": "optional" }
     */
    @PostMapping("/generate-item")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AiStartResponse> generateItem(
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal User user
    ) {
        String prompt = body != null && body.containsKey("prompt") ? body.get("prompt").toString() : null;
        String constraints = body != null && body.containsKey("constraints") ? body.get("constraints").toString() : null;

        UUID jobId = orchestrator.startMenuItemGeneration(user, prompt, constraints);
        activityLogService.log(user, "AI_GENERATE", "AI menu item generation started");

        return ResponseEntity.accepted().body(new AiStartResponse(jobId, "Menu item generation started"));
    }

    /**
     * POST /api/ai/generate-briefing
     * Synchronously generate a 1-2 sentence executive briefing.
     */
    @PostMapping("/generate-briefing")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> generateBriefing(
            @AuthenticationPrincipal User user
    ) {
        String briefing = orchestrator.generateExecutiveBriefing();
        activityLogService.log(user, "AI_BRIEFING", "AI executive briefing generated");
        return ResponseEntity.ok(Map.of("briefing", briefing));
    }

    /**
     * POST /api/ai/generate-forecast
     * Synchronously generate a 1-2 sentence demand forecast.
     */
    @PostMapping("/generate-forecast")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> generateForecast(
            @AuthenticationPrincipal User user
    ) {
        String forecast = orchestrator.generateDemandForecast();
        activityLogService.log(user, "AI_FORECAST", "AI demand forecast generated");
        return ResponseEntity.ok(Map.of("forecast", forecast));
    }

    /**
     * GET /api/ai/jobs/{jobId}
     * Poll job status — HTTP fallback if WebSocket is unavailable.
     */
    @GetMapping("/jobs/{jobId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AiJob> getJob(@PathVariable UUID jobId) {
        return jobService.findById(jobId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
