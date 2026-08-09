package com.virtualtryonsaas.controller;

import com.virtualtryonsaas.entity.Admin;
import com.virtualtryonsaas.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002"}, maxAge = 3600, allowCredentials = "true")
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Admin>> getAllAdmins(Pageable pageable) {
        Page<Admin> admins = adminRepository.findAll(pageable);
        return ResponseEntity.ok(admins);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Admin> getAdmin(@PathVariable UUID id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return ResponseEntity.ok(admin);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Admin> createAdmin(@RequestBody Admin admin) {
        admin.setPasswordHash(passwordEncoder.encode(admin.getPasswordHash()));
        Admin savedAdmin = adminRepository.save(admin);
        return ResponseEntity.ok(savedAdmin);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Admin> updateAdmin(@PathVariable UUID id, @RequestBody Admin adminDetails) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        admin.setEmail(adminDetails.getEmail());
        admin.setFirstName(adminDetails.getFirstName());
        admin.setLastName(adminDetails.getLastName());
        admin.setRole(adminDetails.getRole());
        
        if (adminDetails.getPasswordHash() != null && !adminDetails.getPasswordHash().isEmpty()) {
            admin.setPasswordHash(passwordEncoder.encode(adminDetails.getPasswordHash()));
        }
        
        Admin updatedAdmin = adminRepository.save(admin);
        return ResponseEntity.ok(updatedAdmin);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAdmin(@PathVariable UUID id) {
        adminRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
