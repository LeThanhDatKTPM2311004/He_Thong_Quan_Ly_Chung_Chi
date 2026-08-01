package edu.ctut.certificate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record StudentRegistrationRequest(
                @NotBlank @Pattern(regexp = "^0x[a-fA-F0-9]{40}$") String address,

                @NotBlank String signature,

                @NotBlank String nonce,

                @NotBlank String fullName,

                @NotBlank String studentId) {
}