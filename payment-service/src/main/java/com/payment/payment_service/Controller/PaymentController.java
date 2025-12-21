package com.payment.payment_service.Controller;

import com.payment.payment_service.Service.PaymentService;
import com.payment.payment_service.dto.PaymentRequest;
import com.payment.payment_service.dto.PaymentResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // 1. API Tạo thanh toán (Gọi khi user bấm "Thanh toán")
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(
            HttpServletRequest request,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody PaymentRequest paymentRequest
    ) {
        try {
            paymentRequest.setUserId(userId);
            PaymentResponse res = paymentService.createPayment(request, paymentRequest);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/vnpay-callback")
    public ResponseEntity<?> handleVnPayCallback(HttpServletRequest request) {
        Map<String, String> queryParams = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String paramName = params.nextElement();
            queryParams.put(paramName, request.getParameter(paramName));
        }

        try {
            paymentService.processVnPayCallback(queryParams);
            // Luôn trả về OK để Frontend nhận được
            return ResponseEntity.ok(Map.of("status", "OK", "message", "Success"));
        } catch (Exception e) {
            e.printStackTrace(); // In lỗi ra console server để bạn dễ sửa nếu có
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
