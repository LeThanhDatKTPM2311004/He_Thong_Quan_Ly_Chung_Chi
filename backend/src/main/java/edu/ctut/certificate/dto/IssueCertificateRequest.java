package edu.ctut.certificate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import java.time.LocalDate;

public record IssueCertificateRequest(
        @NotBlank String studentId,
        @NotBlank String fullName,
        @NotBlank String degree,
        String grade,
        @NotBlank String faculty,
        @PastOrPresent LocalDate issueDate
) {}
