package edu.ctut.certificate.dto;

public record TransactionStatusResponse(
        String txHash,
        String status,
        Long blockNumber,
        String errorMessage
) {}
