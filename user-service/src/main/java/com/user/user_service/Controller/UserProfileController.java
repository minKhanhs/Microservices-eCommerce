package com.user.user_service.Controller;


import com.user.user_service.Service.UserProfileService;
import com.user.user_service.dto.AddressDTO;
import com.user.user_service.dto.ChangePasswordRequest;
import com.user.user_service.dto.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserProfileController {
    private final UserProfileService userService;

    // 1. Xem thông tin cá nhân
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    // 2. Cập nhật thông tin
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    // 3. Đổi mật khẩu
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody ChangePasswordRequest request
    ) {
        try {
            userService.changePassword(userId, request);
            return ResponseEntity.ok("Đổi mật khẩu thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. Thêm địa chỉ
    @PostMapping("/address")
    public ResponseEntity<?> addAddress(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody AddressDTO request
    ) {
        userService.addAddress(userId, request);
        return ResponseEntity.ok("Thêm địa chỉ thành công");
    }

    // 5. Xóa địa chỉ
    @DeleteMapping("/address/{addressId}")
    public ResponseEntity<?> deleteAddress(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID addressId
    ) {
        try {
            userService.deleteAddress(userId, addressId);
            return ResponseEntity.ok("Đã xóa địa chỉ");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
