package com.user.user_service.dto;

import com.user.user_service.Model.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String username;
    private String email;
    private Role role;
    private String password;
    private String fullName;
    private String phone;
    private String address;
}
