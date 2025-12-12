package com.order.order_service.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class OrderItemResponse {
    private UUID itemId;
    private UUID productId;
    private String productName;
    private Integer quantity;
    private Double price;
}
