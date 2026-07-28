package com.dineflow.menu.repository;

import com.dineflow.menu.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {
    Page<MenuItem> findByIsAvailableTrue(Pageable pageable);

    @Query("SELECT m FROM MenuItem m LEFT JOIN FETCH m.feedbacks WHERE m.id = :id")
    java.util.Optional<MenuItem> findByIdWithFeedbacks(@Param("id") UUID id);

    @Query("SELECT m FROM MenuItem m WHERE m.isAvailable = false")
    List<MenuItem> findAllUnavailable(Pageable pageable);

    @Query("SELECT m FROM MenuItem m WHERE " +
           "(:categoryId IS NULL OR m.category.id = :categoryId) AND " +
           "(:search IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')))")
    Page<MenuItem> findFiltered(@Param("categoryId") UUID categoryId, @Param("search") String search, Pageable pageable);

    @Query("SELECT m FROM MenuItem m WHERE m.isAvailable = true AND " +
           "(:categoryId IS NULL OR m.category.id = :categoryId) AND " +
           "(:search IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')))")
    Page<MenuItem> findAvailableFiltered(@Param("categoryId") UUID categoryId, @Param("search") String search, Pageable pageable);
}
