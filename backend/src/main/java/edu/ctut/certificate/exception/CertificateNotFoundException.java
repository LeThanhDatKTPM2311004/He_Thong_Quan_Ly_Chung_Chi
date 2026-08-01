package edu.ctut.certificate.exception;

public class CertificateNotFoundException extends RuntimeException {
    public CertificateNotFoundException(String message) {
        super(message);
    }
    public CertificateNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
