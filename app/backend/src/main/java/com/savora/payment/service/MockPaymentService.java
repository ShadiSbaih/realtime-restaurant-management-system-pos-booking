package com.savora.payment.service;

import com.savora.payment.dto.*;
import com.savora.payment.entity.MockPayment;
import com.savora.payment.entity.MockPaymentStatus;
import com.savora.payment.repository.MockPaymentRepository;
import com.savora.pos.entity.Order;
import com.savora.pos.entity.PaymentStatus;
import com.savora.pos.repository.OrderRepository;
import com.savora.realtime.RealtimeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

/**
 * MockPaymentService — completely replaces Stripe.
 * No external API calls, no webhooks from outside.
 * Configurable success rate and simulated delay.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MockPaymentService {

    private final MockPaymentRepository mockPaymentRepository;
    private final OrderRepository orderRepository;
    private final RealtimeService realtimeService;

    @Value("${payments.mock.success-rate}")
    private double successRate;

    @Value("${payments.mock.simulated-delay-ms}")
    private long simulatedDelayMs;

    @Value("${payments.mock.currency}")
    private String currency;

    private static final List<String> FAILURE_REASONS = List.of(
            "insufficient_funds",
            "card_declined",
            "do_not_honor",
            "expired_card",
            "processing_error"
    );

    private final Random random = new Random();

    // ─── Create Intent ────────────────────────────────────────────

    @Transactional
    public PaymentIntentResponse createIntent(CreatePaymentIntentRequest request) {
        Order order = null;
        if (request.getOrderId() != null) {
            order = orderRepository.findById(request.getOrderId()).orElse(null);
        }

        MockPayment payment = MockPayment.builder()
                .order(order)
                .amount(request.getAmount())
                .currency(currency)
                .status(MockPaymentStatus.PENDING)
                .simulatedCardLast4(request.getCardLast4() != null ? request.getCardLast4() : "4242")
                .build();

        MockPayment saved = mockPaymentRepository.save(payment);
        log.info("Created mock payment intent: {}", saved.getId());

        return PaymentIntentResponse.builder()
                .paymentId(saved.getId())
                .clientToken("mock_token_" + saved.getId())
                .amount(saved.getAmount())
                .currency(saved.getCurrency())
                .status(saved.getStatus())
                .build();
    }

    // ─── Confirm Payment (with simulated delay) ───────────────────

    @Async("paymentTaskExecutor")
    @Transactional
    public void confirmAsync(UUID paymentId, boolean forceSuccess) {
        try {
            // Simulate processing latency (800ms–2s by default)
            Thread.sleep(simulatedDelayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        MockPayment payment = mockPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Payment not found: " + paymentId));

        boolean success = forceSuccess || (random.nextDouble() < successRate);

        if (success) {
            payment.setStatus(MockPaymentStatus.SUCCEEDED);
            payment.setConfirmedAt(Instant.now());

            // Fire order-confirmation side-effects (equivalent to Stripe webhook)
            if (payment.getOrder() != null) {
                Order order = payment.getOrder();
                order.setPaymentStatus(PaymentStatus.PAID);
                orderRepository.save(order);
                realtimeService.broadcastNewOrder(Map.of(
                        "orderId", order.getId().toString().substring(order.getId().toString().length() - 6),
                        "orderType", order.getOrderType().name(),
                        "message", "Payment confirmed! " + order.getOrderType().name() + " order ready."
                ));
            }
        } else {
            payment.setStatus(MockPaymentStatus.FAILED);
            payment.setFailureReason(FAILURE_REASONS.get(random.nextInt(FAILURE_REASONS.size())));
        }

        MockPayment saved = mockPaymentRepository.save(payment);

        // Broadcast WebSocket update
        realtimeService.broadcastPaymentStatus(paymentId.toString(), Map.of(
                "paymentId", paymentId,
                "status", saved.getStatus().name(),
                "failureReason", saved.getFailureReason() != null ? saved.getFailureReason() : ""
        ));

        log.info("Payment {} → {}", paymentId, saved.getStatus().name());
    }

    // ─── Synchronous confirm (for tests) ─────────────────────────

    @Transactional
    public PaymentResponse confirmSync(UUID paymentId, boolean forceSuccess) {
        try { Thread.sleep(simulatedDelayMs); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }

        MockPayment payment = mockPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Payment not found"));

        boolean success = forceSuccess || (random.nextDouble() < successRate);

        if (success) {
            payment.setStatus(MockPaymentStatus.SUCCEEDED);
            payment.setConfirmedAt(Instant.now());
            if (payment.getOrder() != null) {
                payment.getOrder().setPaymentStatus(PaymentStatus.PAID);
                orderRepository.save(payment.getOrder());
            }
        } else {
            payment.setStatus(MockPaymentStatus.FAILED);
            payment.setFailureReason(FAILURE_REASONS.get(random.nextInt(FAILURE_REASONS.size())));
        }

        return toResponse(mockPaymentRepository.save(payment));
    }

    // ─── Refund ────────────────────────────────────────────────────

    @Transactional
    public PaymentResponse refund(UUID paymentId) {
        MockPayment payment = mockPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Payment not found"));

        if (payment.getStatus() != MockPaymentStatus.SUCCEEDED) {
            throw new IllegalStateException("Can only refund succeeded payments");
        }
        payment.setStatus(MockPaymentStatus.REFUNDED);
        return toResponse(mockPaymentRepository.save(payment));
    }

    // ─── Status Lookup ─────────────────────────────────────────────

    public PaymentResponse getStatus(UUID paymentId) {
        return mockPaymentRepository.findById(paymentId)
                .map(this::toResponse)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Payment not found"));
    }

    // ─── Webhook Simulation ────────────────────────────────────────

    @Transactional
    public void simulateWebhook(UUID paymentId) {
        MockPayment payment = mockPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Payment not found"));

        if (payment.getStatus() == MockPaymentStatus.SUCCEEDED && payment.getOrder() != null) {
            Order order = payment.getOrder();
            order.setPaymentStatus(PaymentStatus.PAID);
            orderRepository.save(order);
            realtimeService.broadcastNewOrder(Map.of(
                    "orderId", order.getId().toString().substring(order.getId().toString().length() - 6),
                    "message", "Webhook: order confirmed!"
            ));
        }
    }

    private PaymentResponse toResponse(MockPayment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .orderId(p.getOrder() != null ? p.getOrder().getId() : null)
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .status(p.getStatus())
                .simulatedCardLast4(p.getSimulatedCardLast4())
                .createdAt(p.getCreatedAt())
                .confirmedAt(p.getConfirmedAt())
                .failureReason(p.getFailureReason())
                .build();
    }
}
