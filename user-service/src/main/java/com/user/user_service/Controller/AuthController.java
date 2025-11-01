package com.user.user_service.Controller;

import com.user.user_service.Model.Token;
import com.user.user_service.Model.User;
import com.user.user_service.Repo.TokenRepo;
import com.user.user_service.Service.AuthService;
import com.user.user_service.Service.JwtService;
import com.user.user_service.dto.LoginRequest;
import com.user.user_service.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.token.TokenService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);
            return ResponseEntity.ok(user);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {
        try {
            String refreshToken = request.get("refreshToken");
            String newAccessToken = authService.refreshAccessToken(refreshToken);
            return ResponseEntity.ok(Map.of(
                    "accessToken", newAccessToken,
                    "refreshToken", refreshToken
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            authService.logout(authHeader);
            return ResponseEntity.ok("Logout successful");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

}
