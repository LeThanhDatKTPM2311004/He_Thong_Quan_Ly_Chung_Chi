package edu.ctut.certificate.exception;

public class InvalidCertificateStateException extends RuntimeException {
    public InvalidCertificateStateException(String message) {
        super(message);
    }
    public InvalidCertificateStateException(String message, Throwable cause) {
        super(message, cause);
    }
}
