package edu.ctut.certificate.exception;

public class BlockchainConfigurationException extends RuntimeException {
    public BlockchainConfigurationException(String message) {
        super(message);
    }
    public BlockchainConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }
}
