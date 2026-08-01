package edu.ctut.certificate.service;

import edu.ctut.certificate.domain.*;
import edu.ctut.certificate.dto.CreateUserRequest;
import edu.ctut.certificate.dto.UserResponse;
import edu.ctut.certificate.exception.DuplicateResourceException;
import edu.ctut.certificate.exception.ForbiddenOperationException;
import edu.ctut.certificate.exception.UserNotFoundException;
import edu.ctut.certificate.exception.ValidationException;
import edu.ctut.certificate.repository.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final AppUserRepository repository;
    private final AuditService auditService;

    public UserService(AppUserRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    // Chuan hoa dia chi vi: lowercase, dung de so sanh/luu/tra cuu khong phan biet hoa/thuong.
    public static String normalizeAddress(String address) {
        if (address == null) return null;
        return address.trim().toLowerCase();
    }

    public Optional<AppUser> findByWallet(String walletAddress) {
        return repository.findByWalletAddress(normalizeAddress(walletAddress));
    }

    @Transactional
    public AppUser registerPendingStudent(String walletAddress, String fullName, String studentId) {
        String normalized = normalizeAddress(walletAddress);
        if (repository.existsByWalletAddress(normalized)) {
            throw new DuplicateResourceException("Vi nay da duoc dang ky");
        }
        repository.findByStudentId(studentId).ifPresent(u -> {
            throw new DuplicateResourceException("Ma sinh vien da duoc su dung");
        });

        AppUser user = new AppUser();
        user.setWalletAddress(normalized);
        user.setFullName(fullName);
        user.setStudentId(studentId);
        user.setRole(UserRole.STUDENT);
        user.setStatus(UserStatus.PENDING); // cho ADMIN duyet
        AppUser saved = repository.save(user);
        auditService.log(AuditAction.USER_CREATED, null, normalized, "AppUser", String.valueOf(saved.getId()),
                "Dang ky STUDENT moi, cho duyet");
        return saved;
    }

    // Chi ADMIN goi: tao truoc tai khoan ISSUER/ADMIN, kich hoat ngay (khong can qua buoc duyet).
    @Transactional
    public AppUser createUserByAdmin(CreateUserRequest request, Long adminUserId) {
        String normalized = normalizeAddress(request.walletAddress());
        if (repository.existsByWalletAddress(normalized)) {
            throw new DuplicateResourceException("Vi nay da co tai khoan");
        }
        UserRole role;
        try {
            role = UserRole.valueOf(request.role());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Role khong hop le");
        }

        AppUser user = new AppUser();
        user.setWalletAddress(normalized);
        user.setFullName(request.fullName());
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setApprovedAt(Instant.now());
        user.setApprovedByUserId(adminUserId);
        AppUser saved = repository.save(user);
        auditService.log(AuditAction.USER_CREATED, adminUserId, normalized, "AppUser", String.valueOf(saved.getId()),
                "Admin tao tai khoan role=" + role);
        return saved;
    }

    @Transactional
    public AppUser approveUser(Long userId, Long adminUserId) {
        AppUser user = repository.findById(userId).orElseThrow(() -> new UserNotFoundException("Khong tim thay user"));
        user.setStatus(UserStatus.ACTIVE);
        user.setApprovedAt(Instant.now());
        user.setApprovedByUserId(adminUserId);
        AppUser saved = repository.save(user);
        auditService.log(AuditAction.USER_APPROVED, adminUserId, user.getWalletAddress(), "AppUser", String.valueOf(userId), null);
        return saved;
    }

    @Transactional
    public AppUser updateRole(Long userId, UserRole newRole, Long adminUserId) {
        AppUser user = repository.findById(userId).orElseThrow(() -> new UserNotFoundException("Khong tim thay user"));

        // Khong duoc ha/xoa admin cuoi cung trong he thong.
        if (user.getRole() == UserRole.ADMIN && newRole != UserRole.ADMIN) {
            long adminCount = repository.findAll().stream().filter(u -> u.getRole() == UserRole.ADMIN).count();
            if (adminCount <= 1) {
                throw new ForbiddenOperationException("Khong the ha quyen ADMIN cuoi cung trong he thong");
            }
        }

        user.setRole(newRole);
        AppUser saved = repository.save(user);
        auditService.log(AuditAction.ROLE_CHANGED, adminUserId, user.getWalletAddress(), "AppUser", String.valueOf(userId),
                "Doi role thanh " + newRole);
        return saved;
    }

    @Transactional
    public AppUser lockUser(Long userId, Long adminUserId) {
        AppUser user = repository.findById(userId).orElseThrow(() -> new UserNotFoundException("Khong tim thay user"));
        user.setStatus(UserStatus.LOCKED);
        AppUser saved = repository.save(user);
        auditService.log(AuditAction.USER_LOCKED, adminUserId, user.getWalletAddress(), "AppUser", String.valueOf(userId), null);
        return saved;
    }

    public List<AppUser> getAll() {
        return repository.findAll();
    }

    public UserResponse toResponse(AppUser u) {
        return new UserResponse(u.getId(), u.getWalletAddress(), u.getFullName(), u.getStudentId(),
                u.getRole().name(), u.getStatus().name(), u.getCreatedAt(), u.getApprovedAt());
    }
}
