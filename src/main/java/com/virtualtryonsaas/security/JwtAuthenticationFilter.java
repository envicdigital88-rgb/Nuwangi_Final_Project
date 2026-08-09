package com.virtualtryonsaas.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String jwt = null;
        try {
            jwt = getJwtFromRequest(request);
            
            System.out.println("=== JWT FILTER START ===");
            System.out.println("Path: " + request.getRequestURI());
            System.out.println("Token present: " + (jwt != null));
            
            if (jwt != null) {
                System.out.println("Token (first 50 chars): " + jwt.substring(0, Math.min(50, jwt.length())));
            }

            if (StringUtils.hasText(jwt)) {
                System.out.println("Validating token...");
                boolean isValid = tokenProvider.validateToken(jwt);
                System.out.println("Token validation result: " + isValid);
                
                if (isValid) {
                    System.out.println("Token is VALID - extracting claims...");
                    UUID userId = tokenProvider.getUserIdFromToken(jwt);
                    System.out.println("UserId extracted: " + userId);
                    
                    String userType = tokenProvider.getUserType(jwt);
                    System.out.println("UserType extracted: " + userType);

                    UserPrincipal userPrincipal = UserPrincipal.create(userId, "", "", userType);
                    System.out.println("UserPrincipal created with authorities: " + userPrincipal.getAuthorities());

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userPrincipal, null, userPrincipal.getAuthorities()
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("✅ Authentication SET successfully!");
                } else {
                    System.out.println("❌ Token validation FAILED");
                }
            } else {
                System.out.println("❌ No token provided");
            }
        } catch (Exception ex) {
            System.out.println("❌❌❌ JWT FILTER EXCEPTION: " + ex.getClass().getName() + ": " + ex.getMessage());
            ex.printStackTrace(System.out);
        }
        
        System.out.println("=== JWT FILTER END ===");
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
