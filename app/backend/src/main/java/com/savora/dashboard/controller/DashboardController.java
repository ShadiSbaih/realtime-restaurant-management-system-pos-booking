package com.savora.dashboard.controller;

import com.savora.dashboard.dto.*;
import com.savora.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/charts")
    public ResponseEntity<DashboardChartsResponse> getCharts() {
        return ResponseEntity.ok(dashboardService.getCharts());
    }

    @GetMapping("/lists")
    public ResponseEntity<DashboardListsResponse> getLists() {
        return ResponseEntity.ok(dashboardService.getLists());
    }
}
