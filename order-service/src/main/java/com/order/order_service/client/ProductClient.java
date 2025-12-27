package com.order.order_service.client;

import com.order.order_service.dto.ProductResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
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
    @CircuitBreaker(name = "PRODUCT-SERVICE", fallbackMethod = "reduceStockFallback")
    void reduceStock(@PathVariable("id") UUID id, @RequestParam("quantity") int quantity);

    // Gọi API lấy chi tiết (cho Buy Now)
    @GetMapping("/products/{id}")
    @CircuitBreaker(name = "PRODUCT-SERVICE", fallbackMethod = "getProductFallback")
    @Retry(name = "PRODUCT-SERVICE")
    ProductResponse getProductById(@PathVariable("id") UUID id);


    @PutMapping("/products/increase-stock/{id}")
    @CircuitBreaker(name = "PRODUCT-SERVICE", fallbackMethod = "increaseStockFallback")
    void increaseStock(@PathVariable("id") UUID id, @RequestParam("quantity") int quantity);

    default void reduceStockFallback(UUID id, int quantity, Throwable t) {
        System.err.println("Lỗi trừ kho sản phẩm " + id + ": " + t.getMessage());
        throw new RuntimeException("Hệ thống sản phẩm đang bảo trì, không thể đặt hàng lúc này.");
    }

    default ProductResponse getProductFallback(UUID id, Throwable t) {
        System.err.println("Lỗi lấy chi tiết sản phẩm " + id + ": " + t.getMessage());
        return null;
    }

    default void increaseStockFallback(UUID id, int quantity, Throwable t) {
        System.err.println("CRITICAL: Lỗi hoàn kho cho sản phẩm " + id + ". Cần đối soát thủ công!");
    }
}
