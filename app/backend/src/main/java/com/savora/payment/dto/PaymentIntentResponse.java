package com.savora.payment.dto;

import com.savora.payment.entity.MockPaymentStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class PaymentIntentResponse {
    private UUID paymentId;
    private String clientToken;
    private BigDecimal amount;
    private String currency;
    private MockPaymentStatus status;
}
