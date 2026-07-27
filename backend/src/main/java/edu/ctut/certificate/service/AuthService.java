package edu.ctut.certificate.service;

import edu.ctut.certificate.domain.AppUser;
import edu.ctut.certificate.domain.UserRole;
import edu.ctut.certificate.repository.AppUserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AppUserRepository repository;

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
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Sai mat khau");
        }
        return user;
    }
}
