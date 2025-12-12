package com.order.order_service.client;

import com.order.order_service.dto.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(name = "PRODUCT-SERVICE")
public interface ProductClient {

    // Gọi API trừ kho
    @PutMapping("/products/reduce-stock/{id}")
    void reduceStock(@PathVariable("id") UUID id, @RequestParam("quantity") int quantity);

    // Gọi API lấy chi tiết (cho Buy Now)
    @GetMapping("/products/{id}")
    ProductResponse getProductById(@PathVariable("id") UUID id);

    @PutMapping("/products/increase-stock/{id}")
    void increaseStock(@PathVariable("id") UUID id, @RequestParam("quantity") int quantity);
}
