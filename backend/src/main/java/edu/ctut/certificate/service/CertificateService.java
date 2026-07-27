package edu.ctut.certificate.service;

import edu.ctut.certificate.domain.CertStatus;
import edu.ctut.certificate.domain.CertificateBlock;
import edu.ctut.certificate.repository.CertificateBlockRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
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
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CertificateService {

    private final CertificateBlockRepository repository;
    private final Web3j web3j;
    private final Credentials credentials;

    @Value("${web3.contract-address}")
    private String contractAddress;

    private static final long SEPOLIA_CHAIN_ID = 11155111L;
    private final ContractGasProvider gasProvider = new DefaultGasProvider();

    public CertificateService(CertificateBlockRepository repository, Web3j web3j, Credentials credentials) {
        this.repository = repository;
        this.web3j = web3j;
        this.credentials = credentials;
    }

    // ===== PHAT HANH CHUNG CHI - ghi that len Sepolia =====
    public CertificateBlock issueCertificate(String studentId, String fullName, String degree,
                                              String grade, String issueDate, String faculty) throws Exception {

        String certId = "CERT-" + System.currentTimeMillis() + "-" +
                UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Function function = new Function(
                "issueCertificate",
                Arrays.asList(
                        new Utf8String(certId), new Utf8String(studentId), new Utf8String(fullName),
                        new Utf8String(degree), new Utf8String(grade), new Utf8String(issueDate),
                        new Utf8String(faculty)
                ),
                Collections.emptyList()
        );
        String encodedFunction = FunctionEncoder.encode(function);

        RawTransactionManager txManager = new RawTransactionManager(web3j, credentials, SEPOLIA_CHAIN_ID);
        EthSendTransaction response = txManager.sendTransaction(
                gasProvider.getGasPrice(), gasProvider.getGasLimit(), contractAddress, encodedFunction, BigInteger.ZERO);

        if (response.hasError()) {
            throw new RuntimeException("Loi gui giao dich: " + response.getError().getMessage());
        }
        String txHash = response.getTransactionHash();

        CertificateBlock block = new CertificateBlock();
        block.setCertId(certId);
        block.setStudentId(studentId);
        block.setFullName(fullName);
        block.setDegree(degree);
        block.setGrade(grade);
        block.setIssueDate(issueDate);
        block.setFaculty(faculty);
        block.setIssuedBy("CTUT University");
        block.setStatus(CertStatus.pending);
        block.setTxHash(txHash);
        block.setHash(txHash);
        block.setTimestamp(System.currentTimeMillis() / 1000);
        block.setIpfsDoc("");

        return repository.save(block);
    }

    // ===== KIEM TRA TRANG THAI GIAO DICH THAT TREN CHAIN =====
    public CertificateBlock confirmCertificate(String txHash) throws Exception {
        CertificateBlock block = repository.findByTxHash(txHash)
                .orElseThrow(() -> new RuntimeException("Khong tim thay giao dich trong DB"));

        Optional<TransactionReceipt> receiptOpt = web3j.ethGetTransactionReceipt(txHash).send().getTransactionReceipt();

        if (receiptOpt.isPresent() && receiptOpt.get().isStatusOK()) {
            block.setStatus(CertStatus.confirmed);
            repository.save(block);
        }
        return block;
    }

    // ===== TRA CUU - doc that tu chain (view function, mien phi gas) =====
    public CertificateBlock verifyCertificate(String query) throws Exception {
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

        String result = web3j.ethCall(
                Transaction.createEthCallTransaction(credentials.getAddress(), contractAddress, encodedFunction),
                DefaultBlockParameterName.LATEST
        ).send().getValue();

        List<Type> decoded = FunctionReturnDecoder.decode(result, function.getOutputParameters());
        boolean exists = (Boolean) decoded.get(6).getValue();
        if (!exists) return null;

        CertificateBlock block = repository.findByCertId(query).orElse(new CertificateBlock());
        block.setCertId(query);
        block.setStudentId((String) decoded.get(0).getValue());
        block.setFullName((String) decoded.get(1).getValue());
        block.setDegree((String) decoded.get(2).getValue());
        block.setGrade((String) decoded.get(3).getValue());
        block.setIssueDate((String) decoded.get(4).getValue());
        block.setFaculty((String) decoded.get(5).getValue());
        boolean revoked = (Boolean) decoded.get(7).getValue();
        block.setStatus(revoked ? CertStatus.revoked : CertStatus.confirmed);
        return block;
    }

    // ===== THU HOI - ghi that len chain =====
    public boolean revokeCertificate(String certId, String reason) throws Exception {
        Function function = new Function(
                "revokeCertificate",
                Arrays.asList(new Utf8String(certId), new Utf8String(reason)),
                Collections.emptyList()
        );
        String encodedFunction = FunctionEncoder.encode(function);

        RawTransactionManager txManager = new RawTransactionManager(web3j, credentials, SEPOLIA_CHAIN_ID);
        EthSendTransaction response = txManager.sendTransaction(
                gasProvider.getGasPrice(), gasProvider.getGasLimit(), contractAddress, encodedFunction, BigInteger.ZERO);

        if (response.hasError()) return false;

        repository.findByCertId(certId).ifPresent(block -> {
            block.setStatus(CertStatus.revoked);
            repository.save(block);
        });
        return true;
    }

    public List<CertificateBlock> getAllCertificates() {
        return repository.findAllByOrderByBlockIndexAsc();
    }

    public List<CertificateBlock> getByStudentId(String studentId) {
        return repository.findAllByOrderByBlockIndexAsc().stream()
                .filter(b -> b.getStudentId().equals(studentId))
                .toList();
    }
}
