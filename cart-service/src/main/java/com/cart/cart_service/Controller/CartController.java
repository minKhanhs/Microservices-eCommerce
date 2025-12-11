package com.cart.cart_service.Controller;

import com.cart.cart_service.Service.CartService;
import com.cart.cart_service.dto.AddToCartRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody AddToCartRequest request
    ) {
        try {
            cartService.addToCart(userId, request);
            return ResponseEntity.ok("Đã thêm sản phẩm vào giỏ hàng");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // 1. Xem giỏ hàng
    @GetMapping
    public ResponseEntity<?> getMyCart(@RequestHeader("X-User-Id") UUID userId) {
        try {
            return ResponseEntity.ok(cartService.getMyCart(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // 2. Xóa sản phẩm khỏi giỏ
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromCart(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID productId
    ) {
        try {
            cartService.removeFromCart(userId, productId);
            return ResponseEntity.ok("Đã xóa sản phẩm khỏi giỏ hàng");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 3. Cập nhật số lượng
    @PutMapping("/update")
    public ResponseEntity<?> updateQuantity(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody AddToCartRequest request
    ) {
        try {
            cartService.updateQuantity(userId, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok("Cập nhật số lượng thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
