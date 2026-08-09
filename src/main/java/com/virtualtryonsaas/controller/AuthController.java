package com.virtualtryonsaas.controller;

import com.virtualtryonsaas.dto.LoginRequest;
import com.virtualtryonsaas.dto.LoginResponse;
import com.virtualtryonsaas.dto.RegisterRequest;
import com.virtualtryonsaas.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002"}, maxAge = 3600, allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.registerUser(registerRequest);
        return ResponseEntity.ok().body("User registered successfully");
    }

    @PostMapping("/admin/login")
    public ResponseEntity<LoginResponse> adminLogin(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.authenticateAdmin(loginRequest);
        return ResponseEntity.ok(response);
    }
}