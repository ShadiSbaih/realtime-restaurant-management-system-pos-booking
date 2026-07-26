package com.dineflow.payment.entity;

import com.dineflow.pos.entity.Order;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "mock_payments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MockPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "mock_payment_status", nullable = false)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private MockPaymentStatus status = MockPaymentStatus.PENDING;

    @Column(name = "simulated_card_last4", nullable = false, length = 4)
    private String simulatedCardLast4 = "4242";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "failure_reason")
    private String failureReason;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
