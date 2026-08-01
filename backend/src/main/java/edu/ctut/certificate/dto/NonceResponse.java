package edu.ctut.certificate.dto;

import java.time.Instant;

public record NonceResponse(
        String address,
        String nonce,
        String message,
        Instant issuedAt,
        Instant expiresAt
) {}
