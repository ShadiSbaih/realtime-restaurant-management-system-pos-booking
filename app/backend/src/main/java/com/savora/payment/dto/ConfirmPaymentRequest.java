package com.savora.payment.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ConfirmPaymentRequest {
    private UUID paymentId;
    private Boolean forceSuccess; // optional: for demo "Simulate failure" toggle
}
