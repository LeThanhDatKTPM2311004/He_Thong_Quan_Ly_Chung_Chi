package edu.ctut.certificate.repository;

import edu.ctut.certificate.domain.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    Optional<Certificate> findByCertId(String certId);

    Optional<Certificate> findByIssueTxHash(String issueTxHash);

    Optional<Certificate> findByRevokeTxHash(String revokeTxHash);

    boolean existsByCertId(String certId);

    List<Certificate> findAllByStudentIdOrderByCreatedAtAsc(String studentId);

    Page<Certificate> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
