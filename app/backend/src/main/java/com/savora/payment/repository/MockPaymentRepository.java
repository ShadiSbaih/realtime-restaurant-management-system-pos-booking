package com.savora.payment.repository;

import com.savora.payment.entity.MockPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MockPaymentRepository extends JpaRepository<MockPayment, UUID> {
}
