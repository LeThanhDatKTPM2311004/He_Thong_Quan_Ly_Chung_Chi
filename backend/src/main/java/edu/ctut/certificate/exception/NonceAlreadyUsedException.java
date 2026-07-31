package edu.ctut.certificate.exception;

public class NonceAlreadyUsedException extends RuntimeException {
    public NonceAlreadyUsedException(String message) {
        super(message);
    }
    public NonceAlreadyUsedException(String message, Throwable cause) {
        super(message, cause);
    }
}
