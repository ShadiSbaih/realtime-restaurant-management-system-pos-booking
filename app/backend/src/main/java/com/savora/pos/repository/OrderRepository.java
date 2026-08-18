package com.savora.pos.repository;

import com.savora.pos.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findAll(Pageable pageable);
    Page<Order> findByUserId(UUID userId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.createdAt >= :from AND o.status != 'CANCELLED'")
    List<Order> findRecentOrders(@Param("from") Instant from);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.menuItem WHERE o.createdAt >= :from AND o.paymentStatus = 'PAID' AND o.status != 'CANCELLED'")
    List<Order> findPaidOrdersWithItemsSince(@Param("from") Instant from);
}
