package com.payment.payment_service.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class OrderResponse {
    private UUID orderId;
    private UUID userId;
    private Double totalAmount;
    private String status;
}