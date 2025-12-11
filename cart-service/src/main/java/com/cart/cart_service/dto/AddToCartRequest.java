package com.cart.cart_service.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AddToCartRequest {
    private UUID productId;
    private int quantity;
}
