package edu.ctut.certificate.service;

import edu.ctut.certificate.config.ServerWalletProvider;
import edu.ctut.certificate.domain.AuditAction;
import edu.ctut.certificate.domain.CertStatus;
import edu.ctut.certificate.domain.Certificate;
import edu.ctut.certificate.dto.*;
import edu.ctut.certificate.exception.*;
import edu.ctut.certificate.repository.CertificateRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Bool;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.gas.ContractGasProvider;
import org.web3j.tx.gas.DefaultGasProvider;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CertificateService {

    private final CertificateRepository repository;
    private final Web3j web3j;
    private final ServerWalletProvider walletProvider;
    private final AuditService auditService;
    private final ContractGasProvider gasProvider = new DefaultGasProvider();

    @Value("${web3.chain-id:11155111}")
    private long chainId;

    public CertificateService(CertificateRepository repository, Web3j web3j,
                               ServerWalletProvider walletProvider, AuditService auditService) {
        this.repository = repository;
        this.web3j = web3j;
        this.walletProvider = walletProvider;
        this.auditService = auditService;
    }

    // ===== PHAT HANH CHUNG CHI - ghi that len Sepolia =====
    @Transactional
    public IssueCertificateResponse issueCertificate(IssueCertificateRequest request, Long issuerUserId) {
        walletProvider.assertConfigured();

        String certId = "CERT-" + System.currentTimeMillis() + "-" +
                UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        String issueDateStr = request.issueDate() == null ? "" : request.issueDate().toString();
        String dataHash = sha256Hex(String.join("|", certId, request.studentId(), request.fullName(),
                request.degree(), nvl(request.grade()), issueDateStr, request.faculty()));

        Credentials credentials = walletProvider.credentials();
        String contractAddress = walletProvider.contractAddress();

        Function function = new Function(
                "issueCertificate",
                Arrays.asList(
                        new Utf8String(certId), new Utf8String(request.studentId()), new Utf8String(request.fullName()),
                        new Utf8String(request.degree()), new Utf8String(nvl(request.grade())), new Utf8String(issueDateStr),
                        new Utf8String(request.faculty())
                ),
                Collections.emptyList()
        );
        String encodedFunction = FunctionEncoder.encode(function);

        String txHash;
        try {
            RawTransactionManager txManager = new RawTransactionManager(web3j, credentials, chainId);
            EthSendTransaction response = txManager.sendTransaction(
                    gasProvider.getGasPrice(), gasProvider.getGasLimit(), contractAddress, encodedFunction, BigInteger.ZERO);

            if (response.hasError()) {
                auditService.log(AuditAction.BLOCKCHAIN_TRANSACTION_FAILED, issuerUserId, credentials.getAddress(),
                        "Certificate", certId, response.getError().getMessage());
                throw new BlockchainTransactionException("Loi gui giao dich: " + response.getError().getMessage());
            }
            txHash = response.getTransactionHash();
        } catch (BlockchainTransactionException e) {
            throw e;
        } catch (Exception e) {
            throw new RpcUnavailableException("Khong the ket noi RPC Sepolia: " + e.getMessage(), e);
        }

        Certificate cert = new Certificate();
        cert.setCertId(certId);
        cert.setStudentId(request.studentId());
        cert.setFullName(request.fullName());
        cert.setDegree(request.degree());
        cert.setGrade(request.grade());
        cert.setIssueDate(request.issueDate());
        cert.setFaculty(request.faculty());
        cert.setIssuedBy("CTUT University");
        cert.setStatus(CertStatus.PENDING);
        cert.setIssueTxHash(txHash);
        cert.setDataHash(dataHash);
        cert.setIssuerUserId(issuerUserId);

        Certificate saved = repository.save(cert);
        auditService.log(AuditAction.CERTIFICATE_ISSUED, issuerUserId, credentials.getAddress(),
                "Certificate", certId, "txHash=" + txHash);

        return new IssueCertificateResponse(saved.getCertId(), saved.getIssueTxHash(), saved.getStatus().name());
    }

    // ===== KIEM TRA TRANG THAI GIAO DICH THAT TREN CHAIN (ap dung ca cho issue va revoke tx) =====
    @Transactional
    public TransactionStatusResponse confirmTransaction(String txHash) {
        Certificate cert = repository.findByIssueTxHash(txHash)
                .or(() -> repository.findByRevokeTxHash(txHash))
                .orElseThrow(() -> new CertificateNotFoundException("Khong tim thay giao dich trong DB"));

        boolean isRevokeTx = txHash.equals(cert.getRevokeTxHash());

        Optional<TransactionReceipt> receiptOpt;
        try {
            receiptOpt = web3j.ethGetTransactionReceipt(txHash).send().getTransactionReceipt();
        } catch (Exception e) {
            throw new RpcUnavailableException("Khong the ket noi RPC Sepolia: " + e.getMessage(), e);
        }

        if (receiptOpt.isEmpty()) {
            // Giao dich chua duoc mine - giu nguyen trang thai PENDING/REVOKE_PENDING.
            return new TransactionStatusResponse(txHash, cert.getStatus().name(), null, cert.getErrorMessage());
        }

        TransactionReceipt receipt = receiptOpt.get();
        if (receipt.isStatusOK()) {
            if (isRevokeTx) {
                cert.setStatus(CertStatus.REVOKED);
                cert.setRevokedAt(Instant.now());
                auditService.log(AuditAction.CERTIFICATE_REVOKED, cert.getRevokedByUserId(), null,
                        "Certificate", cert.getCertId(), "revokeTxHash=" + txHash);
            } else {
                cert.setStatus(CertStatus.CONFIRMED);
                cert.setConfirmedAt(Instant.now());
                auditService.log(AuditAction.CERTIFICATE_CONFIRMED, cert.getIssuerUserId(), null,
                        "Certificate", cert.getCertId(), "issueTxHash=" + txHash);
            }
            cert.setBlockNumber(receipt.getBlockNumber() == null ? null : receipt.getBlockNumber().longValue());
        } else {
            cert.setStatus(CertStatus.FAILED);
            cert.setErrorMessage("Giao dich bi revert tren chain");
            auditService.log(AuditAction.BLOCKCHAIN_TRANSACTION_FAILED, null, null,
                    "Certificate", cert.getCertId(), "txHash=" + txHash + " reverted");
        }

        Certificate saved = repository.save(cert);
        return new TransactionStatusResponse(txHash, saved.getStatus().name(),
                saved.getBlockNumber(), saved.getErrorMessage());
    }

    // ===== TRA CUU - doc that tu chain (view function, mien phi gas) va doi chieu voi DB =====
    public VerifyCertificateResponse verifyCertificate(String query) {
        walletProvider.assertConfigured();
        String contractAddress = walletProvider.contractAddress();

        Function function = new Function(
                "verifyCertificate",
                Collections.singletonList(new Utf8String(query)),
                Arrays.asList(
                        new TypeReference<Utf8String>() {}, new TypeReference<Utf8String>() {},
                        new TypeReference<Utf8String>() {}, new TypeReference<Utf8String>() {},
                        new TypeReference<Utf8String>() {}, new TypeReference<Utf8String>() {},
                        new TypeReference<Bool>() {}, new TypeReference<Bool>() {}
                )
        );
        String encodedFunction = FunctionEncoder.encode(function);

        String result;
        try {
            result = web3j.ethCall(
                    Transaction.createEthCallTransaction(walletProvider.credentials().getAddress(), contractAddress, encodedFunction),
                    DefaultBlockParameterName.LATEST
            ).send().getValue();
        } catch (Exception e) {
            throw new RpcUnavailableException("Khong the ket noi RPC Sepolia: " + e.getMessage(), e);
        }

        List<Type> decoded = FunctionReturnDecoder.decode(result, function.getOutputParameters());
        boolean exists = (Boolean) decoded.get(6).getValue();
        if (!exists) {
            throw new CertificateNotFoundException("Khong tim thay chung chi tren chain");
        }

        Certificate dbCert = repository.findByCertId(query).orElse(null);
        boolean revokedOnChain = (Boolean) decoded.get(7).getValue();
        String onChainStudentId = (String) decoded.get(0).getValue();
        String onChainFullName = (String) decoded.get(1).getValue();
        String onChainDegree = (String) decoded.get(2).getValue();
        String onChainGrade = (String) decoded.get(3).getValue();
        String onChainIssueDate = (String) decoded.get(4).getValue();
        String onChainFaculty = (String) decoded.get(5).getValue();

        boolean matched = false;
        if (dbCert != null) {
            String recomputedHash = sha256Hex(String.join("|", query, onChainStudentId, onChainFullName,
                    onChainDegree, nvl(onChainGrade), nvl(onChainIssueDate), onChainFaculty));
            matched = recomputedHash.equalsIgnoreCase(dbCert.getDataHash());
        }

        String status = revokedOnChain ? CertStatus.REVOKED.name()
                : (dbCert != null ? dbCert.getStatus().name() : CertStatus.CONFIRMED.name());

        return new VerifyCertificateResponse(
                query, onChainFullName, onChainDegree,
                dbCert != null ? dbCert.getIssuedBy() : "CTUT University",
                onChainIssueDate, onChainFaculty,
                dbCert != null ? dbCert.getIssueTxHash() : null,
                dbCert != null ? dbCert.getIpfsCid() : null,
                status, matched
        );
    }

    // ===== THU HOI - ghi that len chain, khong danh dau REVOKED ngay khi moi gui =====
    @Transactional
    public RevokeCertificateResponse revokeCertificate(String certId, String reason, Long adminUserId) {
        walletProvider.assertConfigured();

        Certificate cert = repository.findByCertId(certId)
                .orElseThrow(() -> new CertificateNotFoundException("Khong tim thay chung chi: " + certId));

        if (cert.getStatus() == CertStatus.REVOKED || cert.getStatus() == CertStatus.REVOKE_PENDING) {
            throw new InvalidCertificateStateException("Chung chi da bi thu hoi hoac dang cho xac nhan thu hoi");
        }
        if (cert.getStatus() != CertStatus.CONFIRMED) {
            throw new InvalidCertificateStateException("Chi thu hoi duoc chung chi da CONFIRMED tren chain");
        }

        Credentials credentials = walletProvider.credentials();
        String contractAddress = walletProvider.contractAddress();

        Function function = new Function(
                "revokeCertificate",
                Arrays.asList(new Utf8String(certId), new Utf8String(reason)),
                Collections.emptyList()
        );
        String encodedFunction = FunctionEncoder.encode(function);

        String txHash;
        try {
            RawTransactionManager txManager = new RawTransactionManager(web3j, credentials, chainId);
            EthSendTransaction response = txManager.sendTransaction(
                    gasProvider.getGasPrice(), gasProvider.getGasLimit(), contractAddress, encodedFunction, BigInteger.ZERO);
            if (response.hasError()) {
                throw new BlockchainTransactionException("Loi gui giao dich thu hoi: " + response.getError().getMessage());
            }
            txHash = response.getTransactionHash();
        } catch (BlockchainTransactionException e) {
            throw e;
        } catch (Exception e) {
            throw new RpcUnavailableException("Khong the ket noi RPC Sepolia: " + e.getMessage(), e);
        }

        cert.setStatus(CertStatus.REVOKE_PENDING);
        cert.setRevokeTxHash(txHash);
        cert.setRevokeReason(reason);
        cert.setRevokedByUserId(adminUserId);
        Certificate saved = repository.save(cert);

        return new RevokeCertificateResponse(saved.getCertId(), saved.getRevokeTxHash(), saved.getStatus().name());
    }

    public Page<Certificate> getAllPaged(Pageable pageable) {
        return repository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public List<Certificate> getByStudentId(String studentId) {
        return repository.findAllByStudentIdOrderByCreatedAtAsc(studentId);
    }

    public CertificateResponse toResponse(Certificate c) {
        return new CertificateResponse(c.getId(), c.getCertId(), c.getStudentId(), c.getFullName(), c.getDegree(),
                c.getGrade(), c.getFaculty(), c.getIssueDate(), c.getIssuedBy(), c.getIssueTxHash(), c.getRevokeTxHash(),
                c.getStatus().name(), c.getRevokeReason(), c.getCreatedAt(), c.getConfirmedAt(), c.getRevokedAt(),
                c.getErrorMessage(), c.getBlockNumber());
    }

    private static String nvl(String s) {
        return s == null ? "" : s;
    }

    private static String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new IllegalStateException("Khong the tinh SHA-256", e);
        }
    }
}
