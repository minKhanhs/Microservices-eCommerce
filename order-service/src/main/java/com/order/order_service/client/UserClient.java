package com.order.order_service.client;

import com.order.order_service.dto.UserProfileResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Collections;
import java.util.UUID;

@FeignClient(name = "USER-SERVICE")
public interface UserClient {
    @GetMapping("/user/profile")
    @CircuitBreaker(name = "USER-SERVICE", fallbackMethod = "getProfileFallback")
    @Retry(name = "USER-SERVICE")
    UserProfileResponse getProfile(@RequestHeader("X-User-Id") UUID userId);

    default UserProfileResponse getProfileFallback(UUID userId, Throwable t) {
        System.err.println("User Service timeout/error: " + t.getMessage());
        // Trả về thông tin giả hoặc null.
        // Order Service có thể vẫn cho đặt hàng nhưng thiếu thông tin user chi tiết
        return new UserProfileResponse(userId, "N/A", "Unknown", "N/A","N/A", Collections.emptyList() );
    }
}