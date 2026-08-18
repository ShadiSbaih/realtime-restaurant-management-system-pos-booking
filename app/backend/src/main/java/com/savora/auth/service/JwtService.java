package com.savora.auth.service;

import com.savora.auth.entity.TokenBlacklist;
import com.savora.auth.entity.User;
import com.savora.auth.repository.TokenBlacklistRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.access-token-expiry-ms}")
    private long accessTokenExpiryMs;

    private final TokenBlacklistRepository tokenBlacklistRepository;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(
                java.util.Base64.getEncoder().encodeToString(jwtSecret.getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(User user) {
        String jti = UUID.randomUUID().toString();
        return Jwts.builder()
                .id(jti)
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("name", user.getName())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiryMs))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUserId(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractJti(String token) {
        return extractAllClaims(token).getId();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            // Check if the JTI is blacklisted
            String jti = claims.getId();
            if (jti != null && tokenBlacklistRepository.existsByTokenJti(jti)) {
                return false;
            }
            return !claims.getExpiration().before(new Date());
        } catch (JwtException e) {
            return false;
        }
    }

    public void blacklistToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            String jti = claims.getId();
            if (jti != null && !tokenBlacklistRepository.existsByTokenJti(jti)) {
                tokenBlacklistRepository.save(TokenBlacklist.builder()
                        .tokenJti(jti)
                        .expiresAt(claims.getExpiration().toInstant())
                        .build());
            }
        } catch (JwtException ignored) {
            // Token already invalid, nothing to blacklist
        }
    }

    public long getAccessTokenExpiryMs() {
        return accessTokenExpiryMs;
    }
}
