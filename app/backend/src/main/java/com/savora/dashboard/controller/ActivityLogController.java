package com.savora.dashboard.controller;

import com.savora.common.dto.PaginatedResponse;
import com.savora.dashboard.dto.ActivityLogDto;
import com.savora.dashboard.entity.ActivityLog;
import com.savora.dashboard.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities-log")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<PaginatedResponse<ActivityLogDto>> getActivitiesLog(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit);
        Page<ActivityLog> logs = activityLogService.getLogs(pageRequest);
        Page<ActivityLogDto> dtoLogs = logs.map(ActivityLogDto::fromEntity);
        return ResponseEntity.ok(PaginatedResponse.from(dtoLogs));
    }
}
