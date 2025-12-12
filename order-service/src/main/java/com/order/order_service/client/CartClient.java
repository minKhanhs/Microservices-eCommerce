package com.order.order_service.client;

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
    CartResponse getMyCart(@RequestHeader("X-User-Id") UUID userId);

    @DeleteMapping("/cart")
    void removeItems(@RequestHeader("X-User-Id") UUID userId, @RequestBody List<UUID> productIds);
}
