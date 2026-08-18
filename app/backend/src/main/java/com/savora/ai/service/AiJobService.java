package com.savora.ai.service;

import com.savora.ai.entity.AiJob;
import com.savora.ai.entity.AiJobStatus;
import com.savora.ai.entity.AiJobType;
import com.savora.ai.repository.AiJobRepository;
import com.savora.auth.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Map;
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

    @Transactional
    public AiJob create(AiJobType type, User user, Map<String, Object> inputPayload) {
        AiJob job = AiJob.builder()
                .type(type)
                .status(AiJobStatus.PENDING)
                .user(user)
                .inputPayload(inputPayload)
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
    public void markDone(UUID jobId, Map<String, Object> result) {
        aiJobRepository.findById(jobId).ifPresent(job -> {
            job.setStatus(AiJobStatus.DONE);
            job.setResultPayload(result);
            job.setCompletedAt(Instant.now());
            aiJobRepository.save(job);
        });
    }

    @Transactional
    public void markFailed(UUID jobId, String errorMessage) {
        aiJobRepository.findById(jobId).ifPresent(job -> {
            job.setStatus(AiJobStatus.FAILED);
            job.setResultPayload(Map.of("error", errorMessage != null ? errorMessage : "Unknown error"));
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
}
