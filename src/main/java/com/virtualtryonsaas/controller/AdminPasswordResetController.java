package com.virtualtryonsaas.controller;

import com.virtualtryonsaas.entity.Admin;
import com.virtualtryonsaas.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin-reset")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002"}, maxAge = 3600, allowCredentials = "true")
public class AdminPasswordResetController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @PostMapping("/fix-password")
    public ResponseEntity<Map<String, String>> fixAdminPassword() {
        Map<String, String> response = new HashMap<>();
        
        try {
            // Find admin by email
            Admin admin = adminRepository.findByEmail("admin@example.com")
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            // Set new password: admin123
            String newPassword = "admin123";
            admin.setPasswordHash(passwordEncoder.encode(newPassword));
            
            // Save
            adminRepository.save(admin);
            
            response.put("status", "success");
            response.put("message", "Admin password has been reset to: admin123");
            response.put("email", "admin@example.com");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PostMapping("/fix-phone-column")
    public ResponseEntity<Map<String, String>> fixPhoneColumn() {
        Map<String, String> response = new HashMap<>();
        
        try {
            // Fix phone column size in users table
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN phone VARCHAR(50)");
            
            response.put("status", "success");
            response.put("message", "Phone column size has been increased to VARCHAR(50). You can now register with any phone number.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
