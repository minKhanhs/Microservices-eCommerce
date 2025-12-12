package com.user.user_service.Service;

import com.user.user_service.Model.Address;
import com.user.user_service.Model.User;
import com.user.user_service.Repo.AddressRepo;
import com.user.user_service.Repo.UserRepo;
import com.user.user_service.dto.AddressDTO;
import com.user.user_service.dto.ChangePasswordRequest;
import com.user.user_service.dto.UpdateProfileRequest;
import com.user.user_service.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {
    private final UserRepo userRepository;
    private final AddressRepo addressRepository;
    private final PasswordEncoder passwordEncoder;

    // --- 1. XEM THÔNG TIN (Profile) ---
    public UserProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        return mapToProfileResponse(user);
    }

    // --- 2. CẬP NHẬT THÔNG TIN CÁ NHÂN ---
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());

        return mapToProfileResponse(userRepository.save(user));
    }

    // --- 3. ĐỔI MẬT KHẨU ---
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác!");
        }

        // Mã hóa và lưu mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // --- 4. THÊM ĐỊA CHỈ ---
    public void addAddress(UUID userId, AddressDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Address address = Address.builder()
                .user(user)
                .street(request.getStreet())
                .district(request.getDistrict())
                .city(request.getCity())
                .build();

        // Lưu thông qua list của user hoặc save trực tiếp repo đều được
        // Cách này dùng Repo trực tiếp cho gọn
        addressRepository.save(address);
    }

    // --- 5. XÓA ĐỊA CHỈ ---
    public void deleteAddress(UUID userId, UUID id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        // Bảo mật: Phải chắc chắn địa chỉ này là của userId đang đăng nhập
        if (!address.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa địa chỉ này");
        }

        addressRepository.delete(address);
    }

    // --- Helper Mapper ---
    private UserProfileResponse mapToProfileResponse(User user) {
        List<AddressDTO> addressDTOs = user.getAddresses().stream()
                .map(addr -> AddressDTO.builder()
                        .id(addr.getId())
                        .street(addr.getStreet())
                        .district(addr.getDistrict())
                        .city(addr.getCity())
                        // Handle null cho fullAddress để tránh lỗi
                        .fullAddress(addr.getStreet() + ", " + addr.getDistrict() + ", " + addr.getCity())
                        .build())
                .collect(Collectors.toList());

        return UserProfileResponse.builder()
                .id(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .addresses(addressDTOs)
                .build();
    }
}
