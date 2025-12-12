package com.order.order_service.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CartResponse {
    private UUID cartId;
    private UUID userId;
    private Double totalPrice;
    private List<CartItemDTO> items;
}
