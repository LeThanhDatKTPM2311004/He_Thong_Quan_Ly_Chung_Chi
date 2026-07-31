package edu.ctut.certificate.exception;

public class NonceExpiredException extends RuntimeException {
    public NonceExpiredException(String message) {
        super(message);
    }
    public NonceExpiredException(String message, Throwable cause) {
        super(message, cause);
    }
}
