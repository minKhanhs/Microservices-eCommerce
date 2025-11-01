package com.user.user_service.Controller;

import com.user.user_service.Model.Role;
import com.user.user_service.Service.UserService;
import com.user.user_service.dto.ChangeRoleRequest;
import com.user.user_service.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor

public class UserController {
    private final UserService adminService;

    // GET: Lấy tất cả users (có phân trang)
    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy
    ) {
        try {
            Page<UserResponse> users = adminService.getAllUsers(page, size, sortBy);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // GET: Lọc users theo role
    @GetMapping("/role/{role}")
    public ResponseEntity<Page<UserResponse>> getUsersByRole(
            @PathVariable Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy
    ) {
        try {
            Page<UserResponse> users = adminService.getUsersByRole(role, page, size, sortBy);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // GET: Xem chi tiết 1 user
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable UUID userId) {
        try {
            UserResponse user = adminService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    // PUT: Chuyển role user
    @PutMapping("/{userId}/role")
    public ResponseEntity<?> changeUserRole(
            @PathVariable UUID userId,
            @RequestBody ChangeRoleRequest request
    ) {
        try {
            UserResponse updatedUser = adminService.changeUserRole(userId, request.getNewRole());
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error");
        }
    }
}
