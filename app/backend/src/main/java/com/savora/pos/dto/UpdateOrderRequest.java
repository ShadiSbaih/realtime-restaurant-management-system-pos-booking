package com.savora.pos.dto;

import com.savora.pos.entity.OrderStatus;
import com.savora.pos.entity.PaymentMethod;
import com.savora.pos.entity.PaymentStatus;
import lombok.Data;

@Data
public class UpdateOrderRequest {
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
}
