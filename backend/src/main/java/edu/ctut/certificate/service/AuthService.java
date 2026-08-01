package edu.ctut.certificate.service;

import edu.ctut.certificate.config.JwtService;
import edu.ctut.certificate.domain.*;
import edu.ctut.certificate.dto.*;
import edu.ctut.certificate.exception.*;
import edu.ctut.certificate.repository.WalletNonceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final WalletNonceRepository nonceRepository;
    private final UserService userService;
    private final SignatureVerifier signatureVerifier;
    private final JwtService jwtService;
    private final AuditService auditService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${auth.nonce-ttl-minutes}")
    private long nonceTtlMinutes;

    @Value("${auth.domain}")
    private String domain;

    @Value("${web3.chain-id:11155111}")
    private long chainId;

    public AuthService(WalletNonceRepository nonceRepository, UserService userService,
            SignatureVerifier signatureVerifier, JwtService jwtService, AuditService auditService) {
        this.nonceRepository = nonceRepository;
        this.userService = userService;
        this.signatureVerifier = signatureVerifier;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    @Transactional
    public NonceResponse requestNonce(String rawAddress) {
        String address = UserService.normalizeAddress(rawAddress);
        if (address == null || !address.matches("^0x[a-fA-F0-9]{40}$")) {
            throw new ValidationException("Dia chi vi khong hop le");
        }

        nonceRepository.invalidateAllUnusedForWallet(address, Instant.now());

        String nonceValue = generateSecureNonce();
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(nonceTtlMinutes, ChronoUnit.MINUTES);

        String message = buildSiweLikeMessage(address, nonceValue, issuedAt, expiresAt);

        WalletNonce entity = new WalletNonce();
        entity.setWalletAddress(address);
        entity.setNonce(nonceValue);
        entity.setMessage(message);
        entity.setIssuedAt(issuedAt);
        entity.setExpiresAt(expiresAt);
        entity.setUsed(false);
        nonceRepository.save(entity);

        return new NonceResponse(address, nonceValue, message, issuedAt, expiresAt);
    }

    private String generateSecureNonce() {
        byte[] bytes = new byte[24];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String buildSiweLikeMessage(String address, String nonce, Instant issuedAt, Instant expiresAt) {
        return domain + " muon ban dang nhap bang vi Ethereum:\n"
                + address + "\n\n"
                + "He thong Quan ly Chung chi Sinh vien - CTUT\n\n"
                + "URI: https://" + domain + "\n"
                + "Chain ID: " + chainId + "\n"
                + "Nonce: " + nonce + "\n"
                + "Issued At: " + issuedAt + "\n"
                + "Expiration Time: " + expiresAt;
    }

    private WalletNonce loadAndValidateNonce(String address, String nonceValue) {
        WalletNonce nonce = nonceRepository.findByWalletAddressAndNonce(address, nonceValue)
                .orElseThrow(() -> new NonceNotFoundException(
                        "Khong tim thay nonce nay cho vi da cho - hay goi lai /api/auth/nonce"));

        if (nonce.isUsed()) {
            throw new NonceAlreadyUsedException("Nonce da duoc su dung");
        }
        if (Instant.now().isAfter(nonce.getExpiresAt())) {
            throw new NonceExpiredException("Nonce da het han, vui long lay nonce moi");
        }
        return nonce;
    }

    @Transactional
    public AuthResponse login(MetaMaskLoginRequest request) {
        String address = UserService.normalizeAddress(request.address());

        WalletNonce nonce = loadAndValidateNonce(address, request.nonce());

        String recoveredAddress = signatureVerifier.recoverAddress(nonce.getMessage(), request.signature());
        boolean signatureValid = recoveredAddress.equalsIgnoreCase(address);

        log.info("[LOGIN VERIFY] Expected address: {}", address);
        log.info("[LOGIN VERIFY] Request nonce: {}", request.nonce());
        log.info("[LOGIN VERIFY] Stored nonce: {}", nonce.getNonce());
        log.info("[LOGIN VERIFY] Stored message: {}", nonce.getMessage());
        log.info("[LOGIN VERIFY] Recovered address: {}", recoveredAddress);
        log.info("[LOGIN VERIFY] Match: {}", signatureValid);

        if (!signatureValid) {
            auditService.log(AuditAction.LOGIN_FAILED, null, address, "WalletNonce", String.valueOf(nonce.getId()),
                    "Chu ky khong khop");
            throw new WalletSignatureException("Chu ky khong hop le hoac khong khop voi dia chi vi");
        }

        nonce.setUsed(true);
        nonce.setUsedAt(Instant.now());
        nonceRepository.save(nonce);

        AppUser user = userService.findByWallet(address)
                .orElseThrow(() -> new UserNotFoundException(
                        "Vi chua duoc dang ky trong he thong. Vui long dang ky (POST /api/auth/register) hoac lien he ADMIN."));

        if (user.getStatus() == UserStatus.PENDING) {
            throw new ForbiddenOperationException("Tai khoan dang cho ADMIN duyet");
        }
        if (user.getStatus() == UserStatus.LOCKED) {
            throw new ForbiddenOperationException("Tai khoan da bi khoa");
        }

        String token = jwtService.generateToken(user);
        auditService.log(AuditAction.LOGIN_SUCCESS, user.getId(), address, "AppUser", String.valueOf(user.getId()),
                null);

        return AuthResponse.of(token, jwtService.expirationSeconds(), toAuthenticatedUserResponse(user));
    }

    @Transactional
    public AuthenticatedUserResponse registerStudent(StudentRegistrationRequest request) {
        String address = UserService.normalizeAddress(request.address());

        WalletNonce nonce = loadAndValidateNonce(address, request.nonce());

        String recoveredAddress = signatureVerifier.recoverAddress(nonce.getMessage(), request.signature());
        boolean signatureValid = recoveredAddress.equalsIgnoreCase(address);

        log.info("[REGISTER VERIFY] Expected address: {}", address);
        log.info("[REGISTER VERIFY] Request nonce: {}", request.nonce());
        log.info("[REGISTER VERIFY] Stored nonce: {}", nonce.getNonce());
        log.info("[REGISTER VERIFY] Stored message: {}", nonce.getMessage());
        log.info("[REGISTER VERIFY] Recovered address: {}", recoveredAddress);
        log.info("[REGISTER VERIFY] Match: {}", signatureValid);

        if (!signatureValid) {
            throw new WalletSignatureException("Chu ky khong hop le");
        }

        nonce.setUsed(true);
        nonce.setUsedAt(Instant.now());
        nonceRepository.save(nonce);

        AppUser saved = userService.registerPendingStudent(address, request.fullName(), request.studentId());
        return toAuthenticatedUserResponse(saved);
    }

    private AuthenticatedUserResponse toAuthenticatedUserResponse(AppUser user) {
        return new AuthenticatedUserResponse(user.getId(), user.getWalletAddress(), user.getFullName(),
                user.getStudentId(), user.getRole().name(), user.getStatus().name());
    }
}