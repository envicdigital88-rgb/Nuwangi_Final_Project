package com.virtualtryonsaas.controller;

import com.virtualtryonsaas.dto.CustomerLoginRequest;
import com.virtualtryonsaas.dto.CustomerRegisterRequest;
import com.virtualtryonsaas.dto.LoginResponse;
import com.virtualtryonsaas.service.CustomerAuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002"}, maxAge = 3600, allowCredentials = "true")
public class CustomerAuthController {

    @Autowired
    private CustomerAuthService customerAuthService;

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody CustomerRegisterRequest request) {
        LoginResponse response = customerAuthService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody CustomerLoginRequest request) {
        LoginResponse response = customerAuthService.login(request);
        return ResponseEntity.ok(response);
    }
}
