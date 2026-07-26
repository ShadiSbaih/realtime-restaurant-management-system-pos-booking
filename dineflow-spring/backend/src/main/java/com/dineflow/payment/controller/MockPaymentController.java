package com.dineflow.payment.controller;

import com.dineflow.payment.dto.*;
import com.dineflow.payment.service.MockPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * MockPaymentController — replaces all Stripe endpoints.
 * No external SDK, no webhooks from third parties.
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class MockPaymentController {

    private final MockPaymentService mockPaymentService;

    /** Create a payment in PENDING state */
    @PostMapping("/intent")
    public ResponseEntity<PaymentIntentResponse> createIntent(@RequestBody CreatePaymentIntentRequest request) {
        return ResponseEntity.ok(mockPaymentService.createIntent(request));
    }

    /** Confirm payment — applies simulated delay + success/failure logic */
    @PostMapping("/confirm")
    public ResponseEntity<PaymentResponse> confirm(@RequestBody ConfirmPaymentRequest request) {
        boolean forceSuccess = Boolean.TRUE.equals(request.getForceSuccess());
        // Use sync version so Angular gets the result immediately after the delay
        PaymentResponse result = mockPaymentService.confirmSync(request.getPaymentId(), forceSuccess);
        return ResponseEntity.ok(result);
    }

    /** Refund a succeeded payment */
    @PostMapping("/{id}/refund")
    public ResponseEntity<PaymentResponse> refund(@PathVariable UUID id) {
        return ResponseEntity.ok(mockPaymentService.refund(id));
    }

    /** Status lookup (polling fallback if not using WebSocket) */
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(mockPaymentService.getStatus(id));
    }

    /** Internal webhook simulation — fires order-confirmation side-effects */
    @PostMapping("/webhook-simulate")
    public ResponseEntity<Map<String, String>> webhookSimulate(@RequestBody Map<String, String> body) {
        UUID paymentId = UUID.fromString(body.get("paymentId"));
        mockPaymentService.simulateWebhook(paymentId);
        return ResponseEntity.ok(Map.of("message", "Webhook simulation fired"));
    }
}
