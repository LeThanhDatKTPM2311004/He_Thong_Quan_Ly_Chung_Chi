package edu.ctut.certificate.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(
        @NotNull
        String role
) {}
