package com.cart.cart_service.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class CartResponse {
    private UUID cartId;
    private UUID userId;
    private double totalPrice;
    private List<CartItemResponse> items;
}
