package com.order.order_service.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import com.order.order_service.dto.CartResponse;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "CART-SERVICE")
public interface CartClient {

    @GetMapping("/cart")
    @CircuitBreaker(name = "CART-SERVICE", fallbackMethod = "getMyCartFallback")
    @Retry(name = "CART-SERVICE")
    CartResponse getMyCart(@RequestHeader("X-User-Id") UUID userId);

    @DeleteMapping("/cart")
    @CircuitBreaker(name = "CART-SERVICE", fallbackMethod = "removeItemsFallback")
    void removeItems(@RequestHeader("X-User-Id") UUID userId, @RequestBody List<UUID> productIds);

    default CartResponse getMyCartFallback(UUID userId, Throwable t) {
        System.err.println("Cart Service đang bận (Get Cart): " + t.getMessage());
        // Trả về giỏ hàng rỗng để không làm lỗi trang Checkout
        return new CartResponse();
    }

    default void removeItemsFallback(UUID userId, List<UUID> productIds, Throwable t) {
        // Nếu xóa giỏ lỗi, log lại để xử lý sau (background job), không làm fail đơn hàng
        System.err.println("Không thể xóa item khỏi giỏ hàng (Cart Service Error): " + t.getMessage());
    }
}
