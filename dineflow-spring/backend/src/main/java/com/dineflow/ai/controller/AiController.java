package com.dineflow.ai.controller;

import com.dineflow.ai.entity.AiJob;
import com.dineflow.ai.service.AiService;
import com.dineflow.auth.entity.User;
import com.dineflow.dashboard.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final ActivityLogService activityLogService;

    @PostMapping("/smart-menu")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> smartMenu(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user
    ) {
        UUID itemId = UUID.fromString(body.get("itemId").toString());
        aiService.runSmartMenuFeedback(itemId, user.getId().toString(), body);
        activityLogService.log(user, "GENERATE_FEEDBACK", "AI feedback generation started in the background!");
        return ResponseEntity.ok(Map.of("message", "AI Feedback generation started in the background!"));
    }

    @PostMapping("/generate-item")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> generateItem(
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal User user
    ) {
        aiService.runGenerateMenuItem(user.getId().toString(), body);
        activityLogService.log(user, "GENERATE_MENU_ITEM", "AI menu item generation started in the background!");
        return ResponseEntity.ok(Map.of("message", "AI Menu Item generation started in the background!"));
    }

    @PostMapping("/generate-briefing")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> generateBriefing(
            @AuthenticationPrincipal User user
    ) {
        String briefing = aiService.generateExecutiveBriefing();
        activityLogService.log(user, "GENERATE_BRIEFING", "AI executive briefing generated.");
        return ResponseEntity.ok(Map.of("briefing", briefing));
    }

    @PostMapping("/generate-forecast")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> generateForecast(
            @AuthenticationPrincipal User user
    ) {
        String forecast = aiService.generateDemandForecast();
        activityLogService.log(user, "GENERATE_FORECAST", "AI demand forecast generated.");
        return ResponseEntity.ok(Map.of("forecast", forecast));
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<AiJob> getJobStatus(@PathVariable UUID jobId) {
        return aiService.getJobStatus(jobId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
