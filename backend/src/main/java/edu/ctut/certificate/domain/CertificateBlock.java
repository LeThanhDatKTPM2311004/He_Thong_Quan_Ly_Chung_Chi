package edu.ctut.certificate.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Entity
@Table(name = "certificate_blocks")
@Data
public class CertificateBlock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long blockIndex;

    private String certId; // vd: CERT-2024-0891
    private String studentId;
    private String fullName;
    private String degree;
    private String grade;
    private String issueDate;
    private String faculty;
    private String issuedBy;

    @Enumerated(EnumType.STRING)
    private CertStatus status;

    private String previousHash;
    private String hash;
    private String txHash; // = hash, đặt tên vậy cho khớp FE
    private String ipfsDoc; // giả lập, không dùng IPFS thật
    private Long timestamp;
}