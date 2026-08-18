package com.savora.pos.service;

import com.savora.auth.entity.User;
import com.savora.dashboard.service.ActivityLogService;
import com.savora.pos.dto.*;
import com.savora.pos.entity.*;
import com.savora.pos.repository.*;
import com.savora.menu.entity.MenuItem;
import com.savora.menu.repository.MenuItemRepository;
import com.savora.realtime.RealtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final TableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;
    private final RealtimeService realtimeService;
    private final ActivityLogService activityLogService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    @Transactional
    public OrderDto createPosOrder(CreateOrderRequest request, User currentUser) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Items are required");
        }
        if (OrderType.DINE_IN.equals(request.getOrderType()) && request.getTableId() == null) {
            throw new IllegalArgumentException("Table ID is required for dine-in orders");
        }

        // Server-side price validation (prevent frontend spoofing)
        List<UUID> menuItemIds = request.getItems().stream()
                .map(OrderItemRequest::getMenuItemId).toList();
        List<MenuItem> dbItems = menuItemRepository.findAllById(menuItemIds);
        Map<UUID, MenuItem> itemMap = new HashMap<>();
        dbItems.forEach(i -> itemMap.put(i.getId(), i));

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .orderType(request.getOrderType())
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PAID) // POS = immediate payment
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CASH)
                .user(currentUser)
                .build();

        for (OrderItemRequest itemReq : request.getItems()) {
            MenuItem dbItem = itemMap.get(itemReq.getMenuItemId());
            if (dbItem == null) throw new IllegalArgumentException("Menu item not found: " + itemReq.getMenuItemId());
            BigDecimal price = dbItem.getPrice();
            total = total.add(price.multiply(BigDecimal.valueOf(itemReq.getQuantity())));
            orderItems.add(OrderItem.builder()
                    .order(order)
                    .menuItem(dbItem)
                    .quantity(itemReq.getQuantity())
                    .price(price)
                    .notes(itemReq.getNotes())
                    .build());
        }

        order.setTotalAmount(total);
        order.setItems(orderItems);

        // Set table if DINE_IN
        if (OrderType.DINE_IN.equals(request.getOrderType()) && request.getTableId() != null) {
            RestaurantTable table = tableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Table not found"));
            order.setTable(table);
            table.setStatus(TableStatus.OCCUPIED);
            tableRepository.save(table);
        }

        Order saved = orderRepository.save(order);

        realtimeService.broadcastNewOrder(Map.of(
                "orderId", saved.getId().toString().substring(saved.getId().toString().length() - 6),
                "orderType", saved.getOrderType().name(),
                "message", "New " + saved.getOrderType().name() + " order received!"
        ));
        return OrderDto.fromEntity(saved);
    }

    public Page<OrderDto> getOrders(int page, int limit, UUID userId) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Page<Order> orders = userId != null
                ? orderRepository.findByUserId(userId, pageRequest)
                : orderRepository.findAll(pageRequest);
        return orders.map(OrderDto::fromEntity);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'KITCHEN')")
    @Transactional
    public OrderDto updateOrder(UUID id, UpdateOrderRequest request, User currentUser) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Order not found"));

        if (request.getStatus() != null) order.setStatus(request.getStatus());
        if (request.getPaymentStatus() != null) order.setPaymentStatus(request.getPaymentStatus());
        if (request.getPaymentMethod() != null) order.setPaymentMethod(request.getPaymentMethod());

        // Auto-free table when order is completed or cancelled
        if ((OrderStatus.SERVED.equals(request.getStatus()) || OrderStatus.CANCELLED.equals(request.getStatus()))
                && order.getTable() != null) {
            RestaurantTable table = order.getTable();
            table.setStatus(TableStatus.AVAILABLE);
            tableRepository.save(table);
        }

        Order saved = orderRepository.save(order);

        if (request.getStatus() != null) {
            realtimeService.broadcastOrderStatusChanged(Map.of(
                    "orderId", saved.getId().toString().substring(saved.getId().toString().length() - 6),
                    "status", saved.getStatus().name()
            ));
        }
        activityLogService.log(currentUser, "UPDATE_ORDER", "Order updated: " + saved.getId());
        return OrderDto.fromEntity(saved);
    }
}
