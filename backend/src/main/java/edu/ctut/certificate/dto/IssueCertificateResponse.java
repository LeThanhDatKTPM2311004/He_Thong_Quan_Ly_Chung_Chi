package edu.ctut.certificate.dto;

public record IssueCertificateResponse(
        String certId,
        String issueTxHash,
        String status
) {}
