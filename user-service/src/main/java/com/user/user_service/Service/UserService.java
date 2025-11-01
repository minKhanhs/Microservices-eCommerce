package com.user.user_service.Service;

import com.user.user_service.Model.Role;
import com.user.user_service.Model.User;
import com.user.user_service.Repo.UserRepo;
import com.user.user_service.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepo userRepository;

    // Lấy danh sách tất cả users (có phân trang)
    public Page<UserResponse> getAllUsers(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        return userRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    // Lấy danh sách users theo role (có phân trang)
    public Page<UserResponse> getUsersByRole(Role role, int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        return userRepository.findAllByRole(role, pageable)
                .map(this::convertToDTO);
    }

    // Xem chi tiết 1 user
    public UserResponse getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return convertToDTO(user);
    }

    // Chuyển role user
    @Transactional
    public UserResponse changeUserRole(UUID userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        if (user.getRole() == newRole) {
            throw new IllegalArgumentException("User already has role: " + newRole);
        }

        user.setRole(newRole);
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    // Convert User entity sang DTO (không trả về password)
    private UserResponse convertToDTO(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
