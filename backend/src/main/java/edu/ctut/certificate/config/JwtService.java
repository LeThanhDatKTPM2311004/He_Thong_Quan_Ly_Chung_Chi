package edu.ctut.certificate.config;

import edu.ctut.certificate.domain.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-minutes}")
    private long expirationMinutes;

    @Value("${jwt.issuer}")
    private String issuer;

    private SecretKey key() {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET chua duoc cau hinh.");
        }
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET qua ngan, can toi thieu 32 ky tu.");
        }
        return Keys.hmacShaKeyFor(bytes);
    }

    public String generateToken(AppUser user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMinutes * 60_000);
        return Jwts.builder()
                .issuer(issuer)
                .subject(user.getWalletAddress())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .claim("status", user.getStatus().name())
                .claim("studentId", user.getStudentId())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key())
                .compact();
    }

    public long expirationSeconds() {
        return expirationMinutes * 60;
    }

    public Claims parseAndValidate(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key())
                    .requireIssuer(issuer)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new edu.ctut.certificate.exception.AuthenticationException("JWT khong hop le hoac het han");
        }
    }
}