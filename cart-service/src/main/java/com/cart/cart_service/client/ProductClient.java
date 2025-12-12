package com.cart.cart_service.client;

import com.cart.cart_service.dto.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "PRODUCT-SERVICE")
public interface ProductClient {

    // Gọi API xem chi tiết sản phẩm bên Product Service
    @GetMapping("/products/{id}")
    ProductResponse getProductById(@PathVariable("id") UUID id);
}