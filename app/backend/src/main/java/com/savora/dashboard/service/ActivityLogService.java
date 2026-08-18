package com.savora.dashboard.service;

import com.savora.auth.entity.User;
import com.savora.dashboard.entity.ActivityLog;
import com.savora.dashboard.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Async
    public void log(User user, String action, String details) {
        if (user == null) return;
        // Just save with the detached user. Spring Data JPA handles this fine in most setups.
        // If it throws detached entity passed to persist, the best way without EntityManager is:
        ActivityLog entry = ActivityLog.builder()
                .user(user)
                .action(action)
                .details(details)
                .build();
        try {
            activityLogRepository.save(entry);
        } catch (Exception e) {
            // Log and ignore to prevent async thread death
            System.err.println("Failed to save activity log: " + e.getMessage());
        }
    }

    public Page<ActivityLog> getLogs(Pageable pageable) {
        return activityLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
