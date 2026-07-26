package com.dineflow.payment.repository;

import com.dineflow.payment.entity.MockPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MockPaymentRepository extends JpaRepository<MockPayment, UUID> {
}
