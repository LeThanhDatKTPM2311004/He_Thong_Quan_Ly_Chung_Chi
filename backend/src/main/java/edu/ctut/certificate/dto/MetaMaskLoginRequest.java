package edu.ctut.certificate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record MetaMaskLoginRequest(
        @NotBlank
        @Pattern(regexp = "^0x[a-fA-F0-9]{40}$", message = "address khong hop le")
        String address,

        @NotBlank
        String signature
) {}
