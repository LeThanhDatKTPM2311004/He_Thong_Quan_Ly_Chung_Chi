package edu.ctut.certificate.controller;

import edu.ctut.certificate.domain.AppUser;
import edu.ctut.certificate.service.AuthService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Khớp với authApi.loginWithWallet(address)
    @PostMapping("/wallet-login")
    public Map<String, Object> walletLogin(@RequestBody Map<String, String> body) {
        AppUser user = authService.loginWithWallet(body.get("address"));
        return toAuthUserResponse(user);
    }

    // Khớp với authApi.loginWithEmail(email, password)
    @PostMapping("/login")
    public Map<String, Object> emailLogin(@RequestBody Map<String, String> body) {
        AppUser user = authService.loginWithEmail(body.get("email"), body.get("password"));
        return toAuthUserResponse(user);
    }

    private Map<String, Object> toAuthUserResponse(AppUser user) {
        return Map.of(
                "address", user.getAddress() == null ? "" : user.getAddress(),
                "email", user.getEmail() == null ? "" : user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().toString());
    }
}