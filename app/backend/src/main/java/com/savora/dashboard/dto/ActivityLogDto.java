package com.savora.dashboard.dto;

import com.savora.dashboard.entity.ActivityLog;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ActivityLogDto {
    private UUID id;
    private String action;
    private String details;
    private Instant createdAt;

    public static ActivityLogDto fromEntity(ActivityLog log) {
        return ActivityLogDto.builder()
                .id(log.getId())
                .action(log.getAction())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
