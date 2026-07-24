package edu.ctut.certificate.repository;

import edu.ctut.certificate.domain.CertificateBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CertificateBlockRepository extends JpaRepository<CertificateBlock, Long> {

    Optional<CertificateBlock> findByCertId(String certId);

    Optional<CertificateBlock> findByTxHash(String txHash);

    List<CertificateBlock> findAllByOrderByBlockIndexAsc();
}