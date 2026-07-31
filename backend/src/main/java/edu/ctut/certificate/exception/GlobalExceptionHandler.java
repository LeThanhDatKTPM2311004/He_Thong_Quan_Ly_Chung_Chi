package edu.ctut.certificate.exception;

import edu.ctut.certificate.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ApiErrorResponse build(HttpServletRequest req, HttpStatus status, String code, String message,
                                    List<ApiErrorResponse.FieldError> fieldErrors) {
        return new ApiErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                code,
                message,
                req.getRequestURI(),
                UUID.randomUUID().toString(),
                fieldErrors == null ? List.of() : fieldErrors
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        List<ApiErrorResponse.FieldError> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> new ApiErrorResponse.FieldError(f.getField(), f.getDefaultMessage()))
                .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(build(req, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Du lieu khong hop le", errors));
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(ValidationException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(build(req, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", ex.getMessage(), null));
    }

    @ExceptionHandler({ AuthenticationException.class, WalletSignatureException.class,
                    NonceExpiredException.class, NonceAlreadyUsedException.class })
    public ResponseEntity<ApiErrorResponse> handleAuth(RuntimeException ex, HttpServletRequest req) {
            String code;
            if (ex instanceof WalletSignatureException) {
                    code = "INVALID_SIGNATURE";
            } else if (ex instanceof NonceExpiredException) {
                    code = "NONCE_EXPIRED";
            } else if (ex instanceof NonceAlreadyUsedException) {
                    code = "NONCE_ALREADY_USED";
            } else {
                    code = "AUTHENTICATION_FAILED";
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(build(req, HttpStatus.UNAUTHORIZED, code, ex.getMessage(), null));
    }

    @ExceptionHandler(ForbiddenOperationException.class)
    public ResponseEntity<ApiErrorResponse> handleForbidden(ForbiddenOperationException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(build(req, HttpStatus.FORBIDDEN, "INSUFFICIENT_PERMISSION", ex.getMessage(), null));
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleSpringForbidden(Exception ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(build(req, HttpStatus.FORBIDDEN, "INSUFFICIENT_PERMISSION", "Ban khong co quyen thuc hien thao tac nay", null));
    }

    @ExceptionHandler({UserNotFoundException.class, CertificateNotFoundException.class})
    public ResponseEntity<ApiErrorResponse> handleNotFound(RuntimeException ex, HttpServletRequest req) {
        String code = ex instanceof UserNotFoundException ? "USER_NOT_FOUND" : "CERTIFICATE_NOT_FOUND";
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(build(req, HttpStatus.NOT_FOUND, code, ex.getMessage(), null));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicate(DuplicateResourceException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(build(req, HttpStatus.CONFLICT, "DUPLICATE_RESOURCE", ex.getMessage(), null));
    }

    @ExceptionHandler(InvalidCertificateStateException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidState(InvalidCertificateStateException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(build(req, HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_CERTIFICATE_STATE", ex.getMessage(), null));
    }

    @ExceptionHandler(BlockchainConfigurationException.class)
    public ResponseEntity<ApiErrorResponse> handleBlockchainConfig(BlockchainConfigurationException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(build(req, HttpStatus.SERVICE_UNAVAILABLE, "BLOCKCHAIN_NOT_CONFIGURED", ex.getMessage(), null));
    }

    @ExceptionHandler(RpcUnavailableException.class)
    public ResponseEntity<ApiErrorResponse> handleRpc(RpcUnavailableException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(build(req, HttpStatus.BAD_GATEWAY, "RPC_UNAVAILABLE", ex.getMessage(), null));
    }

    @ExceptionHandler(BlockchainTransactionException.class)
    public ResponseEntity<ApiErrorResponse> handleBlockchainTx(BlockchainTransactionException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(build(req, HttpStatus.BAD_GATEWAY, "BLOCKCHAIN_TRANSACTION_FAILED", ex.getMessage(), null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(build(req, HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Da xay ra loi khong xac dinh", null));
    }
}
