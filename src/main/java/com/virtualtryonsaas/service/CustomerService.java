package com.virtualtryonsaas.service;

import com.virtualtryonsaas.dto.CustomerDto;
import com.virtualtryonsaas.entity.User;
import com.virtualtryonsaas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CustomerService {

    @Autowired
    private UserRepository userRepository;

    public Page<CustomerDto> getAllCustomers(Pageable pageable) {
        // Show ALL customers to admin, not filtered by tenant
        // Customers are end-users who shop from all stores
        Page<User> users = userRepository.findAll(pageable);
        return users.map(this::convertToDto);
    }

    private CustomerDto convertToDto(User user) {
        CustomerDto dto = new CustomerDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setStatus("Active");
        dto.setCreatedAt(user.getCreatedAt());
        dto.setTryOnCount(0);
        dto.setAverageRating(4.5);
        return dto;
    }
}
