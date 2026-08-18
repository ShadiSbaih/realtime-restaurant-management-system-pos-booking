package com.savora.pos.repository;

import com.savora.pos.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    @Query("SELECT oi FROM OrderItem oi JOIN FETCH oi.menuItem WHERE oi.order.createdAt >= :from AND oi.order.status != 'CANCELLED'")
    List<OrderItem> findRecentOrderItemsWithMenuItems(@Param("from") Instant from);

    @Query(value = "SELECT menu_item_id, SUM(quantity) as total_qty FROM order_items oi " +
                   "JOIN orders o ON o.id = oi.order_id " +
                   "WHERE o.status != 'CANCELLED' " +
                   "GROUP BY menu_item_id ORDER BY total_qty DESC LIMIT 1",
           nativeQuery = true)
    Object[] findTopOrderedMenuItemId();
}
