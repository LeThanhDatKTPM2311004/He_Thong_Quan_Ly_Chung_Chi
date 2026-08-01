package edu.ctut.certificate.dto;

public record AuthenticatedUserResponse(
        Long id,
        String walletAddress,
        String fullName,
        String studentId,
        String role,
        String status
) {}
