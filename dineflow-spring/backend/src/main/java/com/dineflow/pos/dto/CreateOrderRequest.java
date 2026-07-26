package com.dineflow.pos.dto;

import com.dineflow.pos.entity.OrderType;
import com.dineflow.pos.entity.PaymentMethod;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateOrderRequest {
    private List<OrderItemRequest> items;
    private OrderType orderType;
    private UUID tableId;
    private PaymentMethod paymentMethod;
}
