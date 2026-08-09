package com.virtualtryonsaas.controller;

import com.virtualtryonsaas.dto.CustomerDto;
import com.virtualtryonsaas.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002"}, maxAge = 3600, allowCredentials = "true")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping
    public ResponseEntity<Page<CustomerDto>> getAllCustomers(Pageable pageable) {
        Page<CustomerDto> customers = customerService.getAllCustomers(pageable);
        return ResponseEntity.ok(customers);
    }
}
