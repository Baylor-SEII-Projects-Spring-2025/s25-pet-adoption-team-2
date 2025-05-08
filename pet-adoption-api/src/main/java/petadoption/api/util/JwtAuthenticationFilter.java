package petadoption.api.util;

import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    // Defined public paths that should skip JWT authentication
    private final List<RequestMatcher> publicPaths = Arrays.asList(
            new AntPathRequestMatcher("/api/login", "POST"),
            new AntPathRequestMatcher("/api/signup", "POST"),
            new AntPathRequestMatcher("/api/forgot-password", "POST"),
            new AntPathRequestMatcher("/api/reset-password", "POST"),
            new AntPathRequestMatcher("/images/**", "GET"),
            new AntPathRequestMatcher("/uploads/**", "GET"),
            new AntPathRequestMatcher("/api/pets", "GET"),
            new AntPathRequestMatcher("/api/events", "GET"),
            new AntPathRequestMatcher("/api/shelter/events", "GET"), // This is critical for your issue
            new AntPathRequestMatcher("/**", "OPTIONS")
    );

    private final RequestMatcher publicPathsMatcher = new OrRequestMatcher(publicPaths);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        logger.info("Processing request: {} {}", method, requestURI);

        // Skip JWT token validation for public paths
        if (publicPathsMatcher.matches(request)) {
            logger.info("Skipping authentication for public path: {} {}", method, requestURI);
            filterChain.doFilter(request, response);
            return;
        }

        // For protected paths, continue with token validation
        logger.info("Authenticating protected path: {} {}", method, requestURI);
        String token = getTokenFromRequest(request);
        String email = null;

        if (token != null) {
            try {
                email = jwtUtil.extractEmail(token);
                logger.info("Extracted email from token: {}", email);

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    if (jwtUtil.validateToken(token, email)) {
                        logger.info("Token validated successfully for email: {}", email);
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                email, null, null); // Set email as the principal
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    } else {
                        logger.warn("Token validation failed for email: {}", email);
                    }
                }
            } catch (Exception e) {
                logger.error("JWT validation failed", e);
            }
        } else {
            logger.warn("No JWT token found in request header");
        }

        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}