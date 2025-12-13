package com.payment.payment_service.dto;

import com.payment.payment_service.Model.PaymentMethod;
import lombok.Data;

import java.util.UUID;

@Data
public class PaymentRequest {
    private UUID orderId;
    private UUID userId;
    private PaymentMethod paymentMethod;
}
