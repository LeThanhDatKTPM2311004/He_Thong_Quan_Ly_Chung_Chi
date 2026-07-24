package edu.ctut.certificate.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String address; // ví, có thể null
    private String email; // có thể null
    private String password;
    private String name;

    @Enumerated(EnumType.STRING)
    private UserRole role;
}
