package com.capg.userservice.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private Key getSignKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());   //Converts secret string → cryptographic key
    }

    //  Generate Token
    public String generateToken(String email, String role) {

        Map<String, Object> claims = new HashMap<>();  //A claim is a key-value pair stored inside the JWT payload.
        claims.put("role", role);

        return Jwts.builder()
                .setClaims(claims)   //Adds all custom claims (like role) to the token payload
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();   //Converts everything into a final JWT string
    }

    //  Extract Email
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    //  Extract Claims
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}