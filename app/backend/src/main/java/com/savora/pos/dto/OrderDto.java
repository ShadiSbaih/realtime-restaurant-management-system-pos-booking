package com.savora.pos.dto;

import com.savora.pos.entity.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class OrderDto {
    private UUID id;
    private OrderType orderType;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private BigDecimal totalAmount;
    private Instant createdAt;
    private Instant updatedAt;
    private TableDto table;
    private List<OrderItemDto> items;

    public static OrderDto fromEntity(Order order) {
        return OrderDto.builder()
                .id(order.getId())
                .orderType(order.getOrderType())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .table(order.getTable() != null ? TableDto.fromEntity(order.getTable()) : null)
                .items(order.getItems() != null
                        ? order.getItems().stream().map(OrderItemDto::fromEntity).toList()
                        : List.of())
                .build();
    }
}
