package com.order.order_service.Controller;

import com.order.order_service.Model.OrderStatus;
import com.order.order_service.Service.OrderService;
import com.order.order_service.dto.BuyNowRequest;
import com.order.order_service.dto.OrderRequest;
import com.order.order_service.dto.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // --- 1. GET: Lấy danh sách đơn hàng ---
    // ADMIN: Xem hết | USER: Xem của mình
    @GetMapping
    public ResponseEntity<?> getOrders(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader("X-Role") String role, // <--- Lấy thêm Role để check
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        if ("ADMIN".equals(role)) {
            // Nếu là Admin -> Gọi hàm lấy tất cả
            return ResponseEntity.ok(orderService.getAllOrders(pageable));
        } else {
            // Nếu là User -> Gọi hàm lấy theo User ID
            return ResponseEntity.ok(orderService.getMyOrders(userId, pageable));
        }
    }

    // --- 2. GET: Xem chi tiết 1 đơn hàng ---
    // ADMIN: Xem đơn nào cũng được | USER: Chỉ xem đơn của mình
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(
            @PathVariable UUID orderId,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader("X-Role") String role
    ) {
        try {
            // Truyền cả Role và UserId vào Service để Service tự check quyền
            return ResponseEntity.ok(orderService.getOrderById(orderId, userId, role));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // --- 4. PUT: Cập nhật trạng thái
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable UUID orderId,
            @RequestParam OrderStatus status
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }

    // --- 5. Đặt hàng
    @PostMapping("/place/cart")
    public ResponseEntity<?> placeOrderFromCart(
            @RequestHeader("X-User-Id") UUID userId, // Gateway gửi xuống
            @RequestBody OrderRequest request
    ) {
        try {
            OrderResponse response = orderService.placeOrderFromCart(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            // Trả về lỗi 400 kèm thông báo (ví dụ: Hết hàng, Giỏ trống...)
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi hệ thống: " + e.getMessage());
        }
    }
    @PostMapping("/place/buy-now")
    public ResponseEntity<?> placeOrderBuyNow(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody BuyNowRequest request
    ) {
        try {
            OrderResponse response = orderService.placeOrderBuyNow(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi hệ thống: " + e.getMessage());
        }
    }
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID orderId
    ) {
        try {
            orderService.cancelOrder(orderId, userId);
            return ResponseEntity.ok("Hủy đơn hàng thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/internal/{orderId}")
    public ResponseEntity<OrderResponse> getOrderInternal(@PathVariable UUID orderId) {
        return ResponseEntity.ok(orderService.getOrderByIdInternal(orderId));
    }
    @PutMapping("/internal/{orderId}/status")
    public ResponseEntity<?> updateStatusInternal(
            @PathVariable UUID orderId,
            @RequestParam OrderStatus status
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }
}