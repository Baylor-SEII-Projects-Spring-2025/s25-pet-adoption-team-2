package petadoption.api.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key secretKey = Keys.hmacShaKeyFor(
            Decoders.BASE64.decode("v2TonPy3uOL9Me7z/qJmtApNvNRjG+FVBzEpQ82CumweVvFRCWx0hzwU4/9xP95sQUrNxipY3zgkWZ2h9WcFPg==")
    );
    // Generate JWT Token
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours
                .signWith(secretKey)
                .compact();
    }

    // Validate JWT Token
    public Boolean validateToken(String token, String email) {
        String extractedEmail = extractEmail(token);
        return (email.equals(extractedEmail) && !isTokenExpired(token));
    }

    // Extract email from JWT Token
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    // Extract claims (e.g., expiration date)
    private Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Check if the token is expired
    private Boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }
}