package edu.ctut.certificate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

// Chi ADMIN duoc goi: tao truoc tai khoan ISSUER/ADMIN gan voi mot dia chi vi, trang thai ACTIVE ngay.
public record CreateUserRequest(
        @NotBlank
        @Pattern(regexp = "^0x[a-fA-F0-9]{40}$")
        String walletAddress,

        @NotBlank
        String fullName,

        @NotNull
        String role
) {}
