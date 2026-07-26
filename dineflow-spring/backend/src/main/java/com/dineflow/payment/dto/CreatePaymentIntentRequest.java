package com.dineflow.payment.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreatePaymentIntentRequest {
    private UUID orderId;
    private BigDecimal amount;
    private String cardLast4;
}
