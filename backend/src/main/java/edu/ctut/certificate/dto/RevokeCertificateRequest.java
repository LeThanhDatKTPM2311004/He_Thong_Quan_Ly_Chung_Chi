package edu.ctut.certificate.dto;

import jakarta.validation.constraints.NotBlank;

public record RevokeCertificateRequest(
        @NotBlank String reason
) {}
