package edu.ctut.certificate.exception;

public class WalletSignatureException extends RuntimeException {
    public WalletSignatureException(String message) {
        super(message);
    }
    public WalletSignatureException(String message, Throwable cause) {
        super(message, cause);
    }
}
