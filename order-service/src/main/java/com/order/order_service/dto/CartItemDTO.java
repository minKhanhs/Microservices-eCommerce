package com.order.order_service.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class CartItemDTO {
    private UUID itemId;
    private UUID productId;
    private String productName;
    private Double price;
    private Integer quantity;
    private Double subTotal;
}