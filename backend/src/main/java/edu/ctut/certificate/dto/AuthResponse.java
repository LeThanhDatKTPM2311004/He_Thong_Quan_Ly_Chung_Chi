package edu.ctut.certificate.dto;

public record AuthResponse(
        String token,
        String tokenType,
        long expiresInSeconds,
        AuthenticatedUserResponse user
) {
    public static AuthResponse of(String token, long expiresInSeconds, AuthenticatedUserResponse user) {
        return new AuthResponse(token, "Bearer", expiresInSeconds, user);
    }
}
