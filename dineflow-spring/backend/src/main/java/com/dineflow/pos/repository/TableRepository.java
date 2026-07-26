package com.dineflow.pos.repository;

import com.dineflow.pos.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TableRepository extends JpaRepository<RestaurantTable, UUID> {
    Optional<RestaurantTable> findByName(String name);
    boolean existsByName(String name);
}
