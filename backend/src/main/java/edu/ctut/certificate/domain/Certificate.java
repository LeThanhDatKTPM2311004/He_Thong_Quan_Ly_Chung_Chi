package edu.ctut.certificate.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

// Doi ten tu CertificateBlock -> Certificate cho ro rang (khong con dung tu "block" gay nham voi block on-chain).
@Entity
@Table(name = "certificates", uniqueConstraints = {
        @UniqueConstraint(name = "uk_cert_id", columnNames = "certId"),
        @UniqueConstraint(name = "uk_issue_tx_hash", columnNames = "issueTxHash"),
        @UniqueConstraint(name = "uk_revoke_tx_hash", columnNames = "revokeTxHash")
})
@Getter
@Setter
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String certId;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String degree;

    private String grade;
    private String faculty;

    private LocalDate issueDate;

    private String issuedBy;

    @Column(nullable = false)
    private String dataHash;

    private String ipfsCid;

    private String issueTxHash;
    private String revokeTxHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CertStatus status;

    private String revokeReason;

    private Long issuerUserId;
    private Long revokedByUserId;

    private Instant createdAt;
    private Instant confirmedAt;
    private Instant revokedAt;
    private Instant updatedAt;

    private String errorMessage;
    private Long blockNumber;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
