package edu.ctut.certificate.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "app_users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_app_users_wallet", columnNames = "walletAddress"),
        @UniqueConstraint(name = "uk_app_users_student_id", columnNames = "studentId")
})
@Getter
@Setter
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Luon luu dang lowercase (normalize) truoc khi persist - xem UserService.normalizeAddress().
    @Column(nullable = false, length = 42)
    private String walletAddress;

    @Column(nullable = false)
    private String fullName;

    // Bat buoc khi role = STUDENT va da duoc duyet (status = ACTIVE)
    @Column(nullable = true, unique = true)
    private String studentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant approvedAt;
    private Long approvedByUserId;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) this.status = UserStatus.PENDING;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
