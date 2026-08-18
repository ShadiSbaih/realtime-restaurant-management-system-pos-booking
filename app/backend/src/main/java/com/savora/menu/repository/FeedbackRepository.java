package com.savora.menu.repository;

import com.savora.menu.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {
    List<Feedback> findByMenuItemId(UUID menuItemId);
}
