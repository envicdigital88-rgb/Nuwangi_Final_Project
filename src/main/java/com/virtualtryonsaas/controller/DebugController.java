package com.virtualtryonsaas.controller;

import com.virtualtryonsaas.entity.User;
import com.virtualtryonsaas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getUser() {
        Optional<User> user = userRepository.findByEmail("user@example.com");
        Map<String, Object> response = new HashMap<>();
        
        if (user.isPresent()) {
            User u = user.get();
            response.put("id", u.getId());
            response.put("id_string", u.getId().toString());
            response.put("email", u.getEmail());
            response.put("firstName", u.getFirstName());
            response.put("lastName", u.getLastName());
        } else {
            response.put("error", "User not found");
        }
        
        return ResponseEntity.ok(response);
    }
}
