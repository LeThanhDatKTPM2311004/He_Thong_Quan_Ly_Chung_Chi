package edu.ctut.certificate.controller;

import edu.ctut.certificate.config.JwtAuthFilter;
import edu.ctut.certificate.domain.AppUser;
import edu.ctut.certificate.domain.UserRole;
import edu.ctut.certificate.dto.*;
import edu.ctut.certificate.exception.ValidationException;
import edu.ctut.certificate.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Quan ly tai khoan - chi ADMIN")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Danh sach tat ca user (ADMIN)")
    public List<UserResponse> getAll() {
        return userService.getAll().stream().map(userService::toResponse).toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "ADMIN tao truoc tai khoan ISSUER/ADMIN gan voi mot dia chi vi")
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request, Authentication auth) {
        AppUser saved = userService.createUserByAdmin(request, currentUserId(auth));
        return userService.toResponse(saved);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Duyet tai khoan STUDENT dang PENDING")
    public UserResponse approve(@PathVariable Long id, Authentication auth) {
        AppUser saved = userService.approveUser(id, currentUserId(auth));
        return userService.toResponse(saved);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Doi role cua mot user (khong the ha admin cuoi cung)")
    public UserResponse updateRole(@PathVariable Long id, @Valid @RequestBody UpdateUserRoleRequest body, Authentication auth) {
        UserRole newRole;
        try {
            newRole = UserRole.valueOf(body.role());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Role khong hop le");
        }
        AppUser saved = userService.updateRole(id, newRole, currentUserId(auth));
        return userService.toResponse(saved);
    }

    @PutMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Khoa tai khoan")
    public UserResponse lock(@PathVariable Long id, Authentication auth) {
        AppUser saved = userService.lockUser(id, currentUserId(auth));
        return userService.toResponse(saved);
    }

    private Long currentUserId(Authentication auth) {
        return ((JwtAuthFilter.AuthenticatedPrincipal) auth.getPrincipal()).userId();
    }
}
