package edu.ctut.certificate.dto;

import java.time.Instant;
import java.time.LocalDate;

public record CertificateResponse(
        Long id,
        String certId,
        String studentId,
        String fullName,
        String degree,
        String grade,
        String faculty,
        LocalDate issueDate,
        String issuedBy,
        String issueTxHash,
        String revokeTxHash,
        String status,
        String revokeReason,
        Instant createdAt,
        Instant confirmedAt,
        Instant revokedAt,
        String errorMessage,
        Long blockNumber
) {}
