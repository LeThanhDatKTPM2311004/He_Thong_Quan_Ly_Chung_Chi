package edu.ctut.certificate.exception;

public class NonceNotFoundException extends RuntimeException {
    public NonceNotFoundException(String message) {
        super(message);
    }
}