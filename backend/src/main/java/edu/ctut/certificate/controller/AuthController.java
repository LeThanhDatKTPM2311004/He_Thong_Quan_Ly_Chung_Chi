package edu.ctut.certificate.controller;

import edu.ctut.certificate.dto.*;
import edu.ctut.certificate.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Dang nhap/dang ky bang MetaMask (nonce + chu ky)")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/nonce")
    @Operation(summary = "Lay nonce/message de MetaMask ky")
    public NonceResponse nonce(@RequestParam String address) {
        return authService.requestNonce(address);
    }

    @PostMapping("/metamask-login")
    @Operation(summary = "Dang nhap bang chu ky MetaMask, tra ve JWT")
    public AuthResponse login(@Valid @RequestBody MetaMaskLoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    @Operation(summary = "Dang ky tai khoan STUDENT moi (can ADMIN duyet sau do)")
    public AuthenticatedUserResponse register(@Valid @RequestBody StudentRegistrationRequest request) {
        return authService.registerStudent(request);
    }
}
