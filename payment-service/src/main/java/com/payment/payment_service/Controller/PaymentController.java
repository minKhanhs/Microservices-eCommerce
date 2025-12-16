package com.payment.payment_service.Controller;

import com.payment.payment_service.Service.PaymentService;
import com.payment.payment_service.dto.PaymentRequest;
import com.payment.payment_service.dto.PaymentResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
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

    @GetMapping("/vn-pay-callback")
    public ResponseEntity<Void> vnPayCallback(@RequestParam Map<String, String> queryParams) {
        // Địa chỉ Frontend của bạn (Trang Lịch sử đơn hàng)
        String frontendUrl = "http://localhost:5173/orders";
        String redirectUrl = "";

        try {
            // 1. Gọi Service xử lý logic (Lưu DB, update đơn hàng...)
            paymentService.processVnPayCallback(queryParams);

            // 2. Kiểm tra mã phản hồi để quyết định URL redirect
            String vnp_ResponseCode = queryParams.get("vnp_ResponseCode");

            if ("00".equals(vnp_ResponseCode)) {
                // Thành công -> Redirect kèm param success
                redirectUrl = frontendUrl + "?paymentStatus=success";
            } else {
                // Thất bại -> Redirect kèm param failed
                redirectUrl = frontendUrl + "?paymentStatus=failed";
            }

        } catch (Exception e) {
            // Lỗi hệ thống -> Redirect kèm param error
            System.err.println("Lỗi xử lý callback: " + e.getMessage());
            redirectUrl = frontendUrl + "?paymentStatus=error&message=" + e.getMessage();
        }

        // 3. Thực hiện chuyển hướng
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(redirectUrl));

        return new ResponseEntity<>(headers, HttpStatus.FOUND); // 302 Found
    }
}
