package com.payment.payment_service.Controller;

import com.payment.payment_service.Service.PaymentService;
import com.payment.payment_service.dto.PaymentRequest;
import com.payment.payment_service.dto.PaymentResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // 2. API Callback (VNPay sẽ redirect user về link này)
    @GetMapping("/vn-pay-callback")
    public ResponseEntity<?> vnPayCallback(@RequestParam Map<String, String> queryParams) {
        try {
            paymentService.processVnPayCallback(queryParams);

            // Trả về HTML đơn giản hoặc redirect về trang ReactJS/Frontend
            return ResponseEntity.ok("Thanh toán thành công! Bạn có thể đóng tab này.");

            // Hoặc Redirect:
            // HttpHeaders headers = new HttpHeaders();
            // headers.setLocation(URI.create("http://localhost:3000/order-success"));
            // return new ResponseEntity<>(headers, HttpStatus.FOUND);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi thanh toán: " + e.getMessage());
        }
    }
}
