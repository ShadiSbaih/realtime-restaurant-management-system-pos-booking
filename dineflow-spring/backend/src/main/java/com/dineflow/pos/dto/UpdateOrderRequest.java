package com.dineflow.pos.dto;

import com.dineflow.pos.entity.OrderStatus;
import com.dineflow.pos.entity.PaymentMethod;
import com.dineflow.pos.entity.PaymentStatus;
import lombok.Data;

@Data
public class UpdateOrderRequest {
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
}
