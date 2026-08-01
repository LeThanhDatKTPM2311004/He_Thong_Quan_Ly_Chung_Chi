package edu.ctut.certificate.dto;

public record RevokeCertificateResponse(
        String certId,
        String revokeTxHash,
        String status
) {}
