package edu.ctut.certificate.service;

import edu.ctut.certificate.domain.AppUser;
import edu.ctut.certificate.domain.UserRole;
import edu.ctut.certificate.repository.AppUserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AppUserRepository repository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(AppUserRepository repository) {
        this.repository = repository;
    }

    public AppUser loginWithWallet(String address) {
        return repository.findByAddress(address).orElseGet(() -> {
            AppUser user = new AppUser();
            user.setAddress(address);
            user.setName("Nguoi dung moi");
            user.setRole(UserRole.student);
            return repository.save(user);
        });
    }

    public AppUser loginWithEmail(String email, String password) {
        AppUser user = repository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Email khong ton tai"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Sai mat khau");
        }
        return user;
    }

    // Dung khi tao user moi qua SQL/API, de hash mat khau truoc khi luu
    public String hashPassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
}