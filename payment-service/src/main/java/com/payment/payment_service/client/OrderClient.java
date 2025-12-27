package com.payment.payment_service.client;

import com.payment.payment_service.dto.OrderResponse;
import com.payment.payment_service.dto.OrderStatus;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(name = "ORDER-SERVICE")
public interface OrderClient {

    @PutMapping("/orders/internal/{orderId}/status")
    @CircuitBreaker(name = "ORDER-SERVICE", fallbackMethod = "updateOrderStatusFallback")
    @Retry(name = "ORDER-SERVICE")
    void updateOrderStatus(@PathVariable("orderId") UUID orderId, @RequestParam("status") OrderStatus status);
    @GetMapping("/orders/internal/{orderId}")
    @CircuitBreaker(name = "ORDER-SERVICE", fallbackMethod = "getOrderByIdFallback")
    @Retry(name = "ORDER-SERVICE")
    OrderResponse getOrderById(@PathVariable("orderId") UUID orderId);
    default void updateOrderStatusFallback(UUID orderId, OrderStatus status, Throwable t) {
        System.err.println("CRITICAL ALERT: Thanh toán thành công nhưng không thể update Order " + orderId + ". Lỗi: " + t.getMessage());
    }

    default OrderResponse getOrderByIdFallback(UUID orderId, Throwable t) {
        System.err.println("Lỗi kết nối Order Service khi lấy thông tin đơn: " + orderId);
        return null;
    }
}
