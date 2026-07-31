package edu.ctut.certificate.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "wallet_nonces")
@Getter
@Setter
public class WalletNonce {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 42)
    private String walletAddress;

    @Column(nullable = false, unique = true, length = 64)
    private String nonce;

    @Lob
    @Column(nullable = false)
    private String message;

    private Instant issuedAt;
    private Instant expiresAt;
    private Instant usedAt;

    @Column(nullable = false)
    private boolean used = false;
}
