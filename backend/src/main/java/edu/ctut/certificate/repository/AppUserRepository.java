package edu.ctut.certificate.repository;

import edu.ctut.certificate.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    // walletAddress luon duoc normalize (lowercase) truoc khi query - xem UserService.
    Optional<AppUser> findByWalletAddress(String walletAddress);

    Optional<AppUser> findByStudentId(String studentId);

    boolean existsByWalletAddress(String walletAddress);
}
