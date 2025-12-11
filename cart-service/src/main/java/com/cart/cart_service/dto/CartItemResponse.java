package com.cart.cart_service.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CartItemResponse {
    private UUID itemId;
    private UUID productId;
    private String productName;
    private double price;
    private int quantity;
    private double subTotal;
}
