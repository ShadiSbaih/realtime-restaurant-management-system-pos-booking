package com.savora.ai.repository;

import com.savora.ai.entity.AiJob;
import com.savora.ai.entity.AiJobStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface AiJobRepository extends JpaRepository<AiJob, UUID> {
    List<AiJob> findTop10ByUser_IdAndStatusInOrderByCreatedAtDesc(UUID userId, Collection<AiJobStatus> statuses);
}
