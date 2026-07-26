package com.dineflow.ai.repository;

import com.dineflow.ai.entity.AiJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AiJobRepository extends JpaRepository<AiJob, UUID> {
}
