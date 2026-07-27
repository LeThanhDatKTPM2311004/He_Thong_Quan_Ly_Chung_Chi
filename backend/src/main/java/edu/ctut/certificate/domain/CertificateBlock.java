package edu.ctut.certificate.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "certificate_blocks")
@Data
public class CertificateBlock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long blockIndex;

    private String certId;
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
    private String txHash;
    private String ipfsDoc;
    private Long timestamp;
}
