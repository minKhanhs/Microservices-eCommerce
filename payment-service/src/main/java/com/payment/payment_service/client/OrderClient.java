package com.payment.payment_service.client;

import com.payment.payment_service.dto.OrderResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(name = "ORDER-SERVICE")
public interface OrderClient {

    @PutMapping("/orders/internal/{orderId}/status")
    void updateOrderStatus(@PathVariable("orderId") UUID orderId, @RequestParam("status") String status);
    @GetMapping("/orders/internal/{orderId}")
    OrderResponse getOrderById(@PathVariable("orderId") UUID orderId);
}
