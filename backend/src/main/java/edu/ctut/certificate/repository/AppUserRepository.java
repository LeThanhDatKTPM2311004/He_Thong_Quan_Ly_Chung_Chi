package edu.ctut.certificate.repository;

import edu.ctut.certificate.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByAddress(String address);

    Optional<AppUser> findByEmail(String email);
}