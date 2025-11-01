package com.user.user_service.dto;
import com.user.user_service.Model.Role;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChangeRoleRequest {
    private Role newRole;
}