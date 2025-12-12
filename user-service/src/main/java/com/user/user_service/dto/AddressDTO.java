package com.user.user_service.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AddressDTO {
    private UUID id;
    private String street;
    private String city;
    private String district;
    private String fullAddress;
}
