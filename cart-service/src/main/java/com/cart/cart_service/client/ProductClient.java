package com.cart.cart_service.client;

import com.cart.cart_service.dto.ProductResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "PRODUCT-SERVICE")
public interface ProductClient {

    // Gọi API xem chi tiết sản phẩm bên Product Service
    @GetMapping("/products/{id}")
    @CircuitBreaker(name = "PRODUCT-SERVICE", fallbackMethod = "getProductFallback")
    @Retry(name = "PRODUCT-SERVICE")
    ProductResponse getProductById(@PathVariable("id") UUID id);

    default ProductResponse getProductFallback(UUID id, Throwable t) {
        System.err.println("Lỗi khi lấy thông tin sản phẩm " + id + ": " + t.getMessage());
        ProductResponse dummy = new ProductResponse();
        dummy.setId(id);
        dummy.setName("Thông tin sản phẩm tạm thời không khả dụng");
        dummy.setPrice(0);
        return dummy;
    }
}