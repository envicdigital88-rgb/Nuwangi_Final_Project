package com.virtualtryonsaas.controller;

import com.virtualtryonsaas.dto.OrderConfirmationRequest;
import com.virtualtryonsaas.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002"}, allowCredentials = "true")
@Slf4j
public class OrderController {

    private final EmailService emailService;

    @PostMapping("/send-confirmation")
    public ResponseEntity<String> sendOrderConfirmation(@RequestBody OrderConfirmationRequest request) {
        try {
            log.info("Received order confirmation request for order: {}", request.getOrderId());
            emailService.sendOrderConfirmation(request);
            return ResponseEntity.ok("Order confirmation email sent successfully");
        } catch (Exception e) {
            log.error("Failed to send order confirmation email", e);
            return ResponseEntity.status(500).body("Failed to send confirmation email: " + e.getMessage());
        }
    }
}
