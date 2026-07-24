package edu.ctut.certificate.service;

import edu.ctut.certificate.domain.CertStatus;
import edu.ctut.certificate.domain.CertificateBlock;
import edu.ctut.certificate.repository.CertificateBlockRepository;
import edu.ctut.certificate.utils.HashUtil;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class CertificateService {

    private final CertificateBlockRepository repository;

    public CertificateService(CertificateBlockRepository repository) {
        this.repository = repository;
    }

    // Phát hành chứng chỉ mới -> tạo 1 block gắn vào cuối chuỗi
    public CertificateBlock issueCertificate(String studentId, String fullName, String degree,
            String grade, String issueDate, String faculty) {

        List<CertificateBlock> chain = repository.findAllByOrderByBlockIndexAsc();
        String previousHash = chain.isEmpty() ? "0" : chain.get(chain.size() - 1).getHash();

        CertificateBlock block = new CertificateBlock();
        block.setCertId("CERT-" + Instant.now().getEpochSecond() + "-" +
                UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        block.setStudentId(studentId);
        block.setFullName(fullName);
        block.setDegree(degree);
        block.setGrade(grade);
        block.setIssueDate(issueDate);
        block.setFaculty(faculty);
        block.setIssuedBy("CTUT University");
        block.setStatus(CertStatus.pending);
        block.setPreviousHash(previousHash);
        block.setTimestamp(Instant.now().getEpochSecond());
        block.setIpfsDoc("ipfs://simulated-" + UUID.randomUUID());

        String dataToHash = block.getCertId() + block.getStudentId() + block.getFullName()
                + block.getDegree() + block.getIssueDate() + previousHash + block.getTimestamp();
        String hash = HashUtil.sha256(dataToHash);
        block.setHash(hash);
        block.setTxHash(hash);

        return repository.save(block);
    }

    // Giả lập xác nhận giao dịch (giống chờ blockchain confirm)
    public CertificateBlock confirmCertificate(String txHash) {
        CertificateBlock block = repository.findByTxHash(txHash)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch"));
        block.setStatus(CertStatus.confirmed);
        return repository.save(block);
    }

    // Tra cứu theo mã chứng chỉ hoặc txHash
    public CertificateBlock verifyCertificate(String query) {
        return repository.findByCertId(query)
                .or(() -> repository.findByTxHash(query))
                .orElse(null);
    }

    // Thu hồi chứng chỉ
    public boolean revokeCertificate(String certId, String reason) {
        CertificateBlock block = repository.findByCertId(certId).orElse(null);
        if (block == null)
            return false;
        block.setStatus(CertStatus.revoked);
        repository.save(block);
        return true;
    }

    // Kiểm tra toàn vẹn cả chuỗi - phát hiện nếu có block bị sửa data
    public boolean verifyChainIntegrity() {
        List<CertificateBlock> chain = repository.findAllByOrderByBlockIndexAsc();
        String prevHash = "0";
        for (CertificateBlock block : chain) {
            if (!block.getPreviousHash().equals(prevHash))
                return false;
            String dataToHash = block.getCertId() + block.getStudentId() + block.getFullName()
                    + block.getDegree() + block.getIssueDate() + block.getPreviousHash() + block.getTimestamp();
            if (!HashUtil.sha256(dataToHash).equals(block.getHash()))
                return false;
            prevHash = block.getHash();
        }
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