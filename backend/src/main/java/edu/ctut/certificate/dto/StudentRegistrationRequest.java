package edu.ctut.certificate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// Dung khi mot vi MetaMask chua tung dang nhap muon tu dang ky thanh STUDENT (se o trang thai PENDING cho den khi duoc duyet).
public record StudentRegistrationRequest(
        @NotBlank
        @Pattern(regexp = "^0x[a-fA-F0-9]{40}$")
        String address,

        @NotBlank
        String signature,

        @NotBlank
        String fullName,

        @NotBlank
        String studentId
) {}
