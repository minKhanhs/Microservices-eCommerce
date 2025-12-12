package com.order.order_service.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class BuyNowRequest {
    private UUID productId;
    private Integer quantity;
    private UUID addressId;
    private String shippingAddress;
    private String phone;
}
