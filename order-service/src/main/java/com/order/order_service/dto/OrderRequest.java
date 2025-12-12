package com.order.order_service.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class OrderRequest {
    private UUID addressId;
    private String shippingAddress;
    private String phone;
    private List<UUID> selectedProductIds;
}