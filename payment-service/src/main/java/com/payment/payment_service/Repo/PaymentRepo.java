package com.payment.payment_service.Repo;

import com.payment.payment_service.Model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepo extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByOrderId(UUID orderId);
}