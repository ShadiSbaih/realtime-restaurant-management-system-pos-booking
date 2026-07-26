package com.dineflow.dashboard.service;

import com.dineflow.auth.entity.User;
import com.dineflow.dashboard.entity.ActivityLog;
import com.dineflow.dashboard.repository.ActivityLogRepository;
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
        ActivityLog entry = ActivityLog.builder()
                .user(user)
                .action(action)
                .details(details)
                .build();
        activityLogRepository.save(entry);
    }

    public Page<ActivityLog> getLogs(Pageable pageable) {
        return activityLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
