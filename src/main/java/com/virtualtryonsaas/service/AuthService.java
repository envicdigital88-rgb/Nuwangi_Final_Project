package com.virtualtryonsaas.service;

import com.virtualtryonsaas.dto.LoginRequest;
import com.virtualtryonsaas.dto.LoginResponse;
import com.virtualtryonsaas.dto.RegisterRequest;
import com.virtualtryonsaas.entity.User;
import com.virtualtryonsaas.repository.UserRepository;
import com.virtualtryonsaas.security.JwtTokenProvider;
import com.virtualtryonsaas.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private com.virtualtryonsaas.repository.AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String jwt = tokenProvider.generateToken(authentication, "customer");

        return new LoginResponse(
            jwt,
            userPrincipal.getId(),
            userPrincipal.getEmail(),
            "", // firstName - to be implemented
            "" // lastName - to be implemented
        );
    }

    public LoginResponse authenticateAdmin(LoginRequest loginRequest) {
        System.out.println("=== ADMIN LOGIN ATTEMPT ===");
        System.out.println("Email: " + loginRequest.getEmail());
        System.out.println("Password received: " + loginRequest.getPassword());
        
        // Find admin by email
        com.virtualtryonsaas.entity.Admin admin = adminRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> {
                    System.out.println("❌ Admin not found with email: " + loginRequest.getEmail());
                    return new RuntimeException("Admin not found with email: " + loginRequest.getEmail());
                });
        
        System.out.println("✅ Admin found: " + admin.getEmail());
        System.out.println("Password hash from DB: " + admin.getPasswordHash());
        System.out.println("Password hash length: " + admin.getPasswordHash().length());
        
        // Verify password
        boolean matches = passwordEncoder.matches(loginRequest.getPassword(), admin.getPasswordHash());
        System.out.println("Password matches: " + matches);
        
        if (!matches) {
            System.out.println("❌ Invalid password");
            throw new RuntimeException("Invalid password");
        }
        
        System.out.println("✅ Password verified");
        
        // Create authentication token
        UserPrincipal userPrincipal = UserPrincipal.create(
            admin.getId(), 
            admin.getEmail(), 
            admin.getPasswordHash(), 
            "admin"
        );
        
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            userPrincipal, 
            null, 
            userPrincipal.getAuthorities()
        );
        
        String jwt = tokenProvider.generateToken(authentication, "admin");

        return new LoginResponse(
            jwt,
            admin.getId(),
            admin.getEmail(),
            admin.getFirstName(),
            admin.getLastName()
        );
    }

    public void registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());

        userRepository.save(user);
    }
}