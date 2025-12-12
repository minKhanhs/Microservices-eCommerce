package com.order.order_service.client;

import com.order.order_service.dto.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.UUID;

@FeignClient(name = "USER-SERVICE")
public interface UserClient {
    @GetMapping("/user/profile")
    UserProfileResponse getProfile(@RequestHeader("X-User-Id") UUID userId);
}