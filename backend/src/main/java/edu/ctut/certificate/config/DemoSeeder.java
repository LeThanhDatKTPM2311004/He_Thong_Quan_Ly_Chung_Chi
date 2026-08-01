package edu.ctut.certificate.config;

import edu.ctut.certificate.domain.AppUser;
import edu.ctut.certificate.domain.UserRole;
import edu.ctut.certificate.domain.UserStatus;
import edu.ctut.certificate.repository.AppUserRepository;
import edu.ctut.certificate.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;

// Seed idempotent: neu wallet chua ton tai thi tao, da ton tai thi bo qua (khong ghi de role tai khoan dang co).
// Ba dia chi vi that KHONG duoc dua vao source code - chi lay tu bien moi truong khi chay.
@Component
public class DemoSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoSeeder.class);

    private final AppUserRepository repository;

    @Value("${demo.admin-wallet:}")
    private String adminWallet;
    @Value("${demo.issuer-wallet:}")
    private String issuerWallet;
    @Value("${demo.student-wallet:}")
    private String studentWallet;
    @Value("${demo.student-id:}")
    private String studentId;
    @Value("${demo.admin-name:Admin Demo}")
    private String adminName;
    @Value("${demo.issuer-name:Can bo dao tao Demo}")
    private String issuerName;
    @Value("${demo.student-name:Sinh vien Demo}")
    private String studentName;

    public DemoSeeder(AppUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedOne(adminWallet, adminName, UserRole.ADMIN, null);
        seedOne(issuerWallet, issuerName, UserRole.ISSUER, null);
        seedOne(studentWallet, studentName, UserRole.STUDENT, studentId);
    }

    private void seedOne(String rawWallet, String name, UserRole role, String studentIdValue) {
        if (rawWallet == null || rawWallet.isBlank()) {
            log.info("Bo qua seed {} vi chua cau hinh bien moi truong dia chi vi", role);
            return;
        }
        String normalized = UserService.normalizeAddress(rawWallet);
        if (repository.existsByWalletAddress(normalized)) {
            log.info("Seed {}: vi {} da ton tai, bo qua (khong ghi de)", role, normalized);
            return;
        }
        AppUser user = new AppUser();
        user.setWalletAddress(normalized);
        user.setFullName(name);
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setApprovedAt(Instant.now());
        if (role == UserRole.STUDENT && studentIdValue != null && !studentIdValue.isBlank()) {
            user.setStudentId(studentIdValue);
        }
        repository.save(user);
        log.info("Da seed tai khoan demo role={} wallet={}", role, normalized);
    }
}
