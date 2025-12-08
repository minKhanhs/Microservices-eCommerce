package com.product.product_service.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private double price;
    private int stock;
    private List<UUID> categoryIds;
}
