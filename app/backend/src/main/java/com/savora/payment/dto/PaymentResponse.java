package com.savora.payment.dto;

import com.savora.payment.entity.MockPaymentStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class PaymentResponse {
    private UUID id;
    private UUID orderId;
    private BigDecimal amount;
    private String currency;
    private MockPaymentStatus status;
    private String simulatedCardLast4;
    private Instant createdAt;
    private Instant confirmedAt;
    private String failureReason;
}
