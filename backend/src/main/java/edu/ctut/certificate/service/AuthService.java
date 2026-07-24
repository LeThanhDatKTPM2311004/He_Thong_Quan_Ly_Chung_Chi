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

    // Đăng nhập bằng ví -> nếu chưa có trong DB thì tạo mới với role mặc định
    // student
    public AppUser loginWithWallet(String address) {
        return repository.findByAddress(address).orElseGet(() -> {
            AppUser user = new AppUser();
            user.setAddress(address);
            user.setName("Người dùng mới");
            user.setRole(UserRole.student);
            return repository.save(user);
        });
    }

    // Đăng nhập bằng email/mật khẩu
    public AppUser loginWithEmail(String email, String password) {
        AppUser user = repository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Email không tồn tại"));
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Sai mật khẩu");
        }
        return user;
    }
}