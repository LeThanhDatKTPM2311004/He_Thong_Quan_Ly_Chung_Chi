package edu.ctut.certificate.service;

import edu.ctut.certificate.config.JwtService;
import edu.ctut.certificate.domain.*;
import edu.ctut.certificate.dto.MetaMaskLoginRequest;
import edu.ctut.certificate.exception.*;
import edu.ctut.certificate.repository.WalletNonceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock WalletNonceRepository nonceRepository;
    @Mock UserService userService;
    @Mock SignatureVerifier signatureVerifier;
    @Mock JwtService jwtService;
    @Mock AuditService auditService;

    AuthService authService;

    private static final String ADDRESS = "0xabc0000000000000000000000000000000abcd";

    @BeforeEach
    void setUp() {
        authService = new AuthService(nonceRepository, userService, signatureVerifier, jwtService, auditService);
        ReflectionTestUtils.setField(authService, "nonceTtlMinutes", 5L);
        ReflectionTestUtils.setField(authService, "domain", "localhost");
        ReflectionTestUtils.setField(authService, "chainId", 11155111L);
    }

    private WalletNonce freshNonce(boolean used, boolean expired) {
        WalletNonce n = new WalletNonce();
        n.setId(1L);
        n.setWalletAddress(ADDRESS);
        n.setNonce("nonce-1");
        n.setMessage("message-to-sign");
        n.setIssuedAt(Instant.now().minusSeconds(10));
        n.setExpiresAt(expired ? Instant.now().minusSeconds(1) : Instant.now().plusSeconds(300));
        n.setUsed(used);
        return n;
    }

    @Test
    void loginFailsWhenNonceExpired() {
        when(nonceRepository.findAllByWalletAddressAndUsedFalse(ADDRESS)).thenReturn(List.of(freshNonce(false, true)));

        assertThrows(NonceExpiredException.class,
                () -> authService.login(new MetaMaskLoginRequest(ADDRESS, "0xsig")));
    }

    @Test
    void loginFailsWhenSignatureInvalid() {
        when(nonceRepository.findAllByWalletAddressAndUsedFalse(ADDRESS)).thenReturn(List.of(freshNonce(false, false)));
        when(signatureVerifier.matches(any(), any(), any())).thenReturn(false);

        assertThrows(WalletSignatureException.class,
                () -> authService.login(new MetaMaskLoginRequest(ADDRESS, "0xbadsig")));
    }

    @Test
    void loginFailsWhenWalletNotRegistered() {
        when(nonceRepository.findAllByWalletAddressAndUsedFalse(ADDRESS)).thenReturn(List.of(freshNonce(false, false)));
        when(signatureVerifier.matches(any(), any(), any())).thenReturn(true);
        when(userService.findByWallet(ADDRESS)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class,
                () -> authService.login(new MetaMaskLoginRequest(ADDRESS, "0xsig")));
    }

    @Test
    void loginFailsWhenUserPending() {
        when(nonceRepository.findAllByWalletAddressAndUsedFalse(ADDRESS)).thenReturn(List.of(freshNonce(false, false)));
        when(signatureVerifier.matches(any(), any(), any())).thenReturn(true);

        AppUser user = new AppUser();
        user.setId(1L);
        user.setWalletAddress(ADDRESS);
        user.setRole(UserRole.STUDENT);
        user.setStatus(UserStatus.PENDING);
        when(userService.findByWallet(ADDRESS)).thenReturn(Optional.of(user));

        assertThrows(ForbiddenOperationException.class,
                () -> authService.login(new MetaMaskLoginRequest(ADDRESS, "0xsig")));
    }

    @Test
    void loginSucceedsAndMarksNonceUsed() {
        WalletNonce nonce = freshNonce(false, false);
        when(nonceRepository.findAllByWalletAddressAndUsedFalse(ADDRESS)).thenReturn(List.of(nonce));
        when(signatureVerifier.matches(any(), any(), any())).thenReturn(true);

        AppUser user = new AppUser();
        user.setId(1L);
        user.setWalletAddress(ADDRESS);
        user.setRole(UserRole.ADMIN);
        user.setStatus(UserStatus.ACTIVE);
        when(userService.findByWallet(ADDRESS)).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("fake.jwt.token");
        when(jwtService.expirationSeconds()).thenReturn(3600L);

        var response = authService.login(new MetaMaskLoginRequest(ADDRESS, "0xsig"));

        assertEquals("fake.jwt.token", response.token());
        assertTrue(nonce.isUsed());
        verify(nonceRepository).save(nonce);
    }
}
