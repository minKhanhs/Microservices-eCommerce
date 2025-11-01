package com.user.user_service.Service;

import com.user.user_service.Model.Role;
import com.user.user_service.Model.Token;
import com.user.user_service.Model.User;
import com.user.user_service.Repo.TokenRepo;
import com.user.user_service.Repo.UserRepo;
import com.user.user_service.dto.LoginRequest;
import com.user.user_service.dto.LoginResponse;
import com.user.user_service.dto.RegisterRequest;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepository;
    private final TokenRepo tokenRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // -------------------- LOGIN --------------------
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        // Xóa token cũ của user
        tokenRepository.deleteAllByUser(user);

        // Tạo access token & refresh token
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Lưu refresh token vào DB
        Token tokenEntity = Token.builder()
                .token(refreshToken)
                .issuedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(7)) // refresh token sống 7 ngày
                .revoked(false)
                .user(user)
                .build();

        tokenRepository.save(tokenEntity);

        return new LoginResponse(accessToken, refreshToken, user.getUsername());
    }

    // -------------------- REGISTER --------------------
    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(Role.USER)
                .build();

        return userRepository.save(user);
    }

    // -------------------- REFRESH TOKEN --------------------
    public String refreshAccessToken(String refreshTokenValue) {
        Token token = tokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(token);
            throw new RuntimeException("Refresh token expired");
        }

        return jwtService.generateToken(token.getUser());
    }

    @Transactional
    public void logout(String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Invalid token header");
            }

            String accessToken = authHeader.substring(7);

            // Validate access token
            if (!jwtService.isTokenValid(accessToken)) {
                throw new IllegalArgumentException("Invalid or expired access token");
            }

            // Extract username từ access token
            String username = jwtService.extractUsername(accessToken);

            // Tìm user
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Xóa tất cả refresh token của user
            List<Token> validTokens = tokenRepository.findAllByUserAndRevokedFalse(user);
            if (!validTokens.isEmpty()) {
                tokenRepository.deleteAll(validTokens);
            }

        } catch (JwtException e) {
            throw new IllegalArgumentException("Invalid JWT token: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Logout failed: " + e.getMessage());
        }
    }

}
