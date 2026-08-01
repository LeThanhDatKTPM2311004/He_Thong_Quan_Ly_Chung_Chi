package edu.ctut.certificate.dto;

public record VerifyCertificateResponse(
        String certId,
        String holder,
        String degree,
        String issuedBy,
        String issueDate,
        String faculty,
        String issueTxHash,
        String ipfsDoc,
        String status,
        boolean blockchainMatched
) {}
