package edu.ctut.certificate.dto;

import java.time.Instant;

public record UserResponse(
        Long id,
        String walletAddress,
        String fullName,
        String studentId,
        String role,
        String status,
        Instant createdAt,
        Instant approvedAt
) {}
