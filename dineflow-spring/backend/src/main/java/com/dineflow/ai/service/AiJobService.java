package com.dineflow.ai.service;

import com.dineflow.ai.entity.AiJob;
import com.dineflow.ai.entity.AiJobStatus;
import com.dineflow.ai.entity.AiJobType;
import com.dineflow.ai.repository.AiJobRepository;
import com.dineflow.auth.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * AiJobService — single source of truth for job persistence.
 * All methods are @Transactional individually so they commit immediately.
 * This avoids the "lazy session closed in async thread" problem.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiJobService {

    private final AiJobRepository aiJobRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public AiJob create(AiJobType type, User user, Object inputPayload) {
        String input = toJson(inputPayload);
        AiJob job = AiJob.builder()
                .type(type)
                .status(AiJobStatus.PENDING)
                .user(user)
                .inputPayload(input)
                .build();
        return aiJobRepository.save(job);
    }

    @Transactional
    public void markRunning(UUID jobId) {
        aiJobRepository.findById(jobId).ifPresent(job -> {
            job.setStatus(AiJobStatus.RUNNING);
            aiJobRepository.save(job);
        });
    }

    @Transactional
    public void markDone(UUID jobId, Object result) {
        aiJobRepository.findById(jobId).ifPresent(job -> {
            job.setStatus(AiJobStatus.DONE);
            job.setResultPayload(toJson(result));
            job.setCompletedAt(Instant.now());
            aiJobRepository.save(job);
        });
    }

    @Transactional
    public void markFailed(UUID jobId, String errorMessage) {
        aiJobRepository.findById(jobId).ifPresent(job -> {
            job.setStatus(AiJobStatus.FAILED);
            job.setResultPayload(toJson(java.util.Map.of("error", errorMessage != null ? errorMessage : "Unknown error")));
            job.setCompletedAt(Instant.now());
            aiJobRepository.save(job);
        });
    }

    @Transactional(readOnly = true)
    public Optional<AiJob> findById(UUID jobId) {
        return aiJobRepository.findById(jobId);
    }

    @Transactional(readOnly = true)
    public List<AiJob> findRecentActiveJobsByUser(UUID userId, Collection<AiJobStatus> statuses) {
        return aiJobRepository.findTop10ByUser_IdAndStatusInOrderByCreatedAtDesc(userId, statuses);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String toJson(Object obj) {
        if (obj == null) return "{}";
        if (obj instanceof String s) {
            // If already JSON, return as-is; otherwise wrap
            String trimmed = s.trim();
            if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
                return trimmed;
            }
            return toJsonSafe(java.util.Map.of("message", s));
        }
        return toJsonSafe(obj);
    }

    private String toJsonSafe(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("Failed to serialize to JSON: {}", e.getMessage());
            return "{\"error\":\"serialization failed\"}";
        }
    }
}
