package com.virtualtryonsaas.dto;

import java.util.UUID;
import java.time.LocalDateTime;

public class CustomerDto {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String status;
    private LocalDateTime createdAt;
    private int tryOnCount;
    private double averageRating;

    public CustomerDto() {}

    public CustomerDto(UUID id, String email, String firstName, String lastName, String phone, String status, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.status = status;
        this.createdAt = createdAt;
        this.tryOnCount = 0;
        this.averageRating = 0.0;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public int getTryOnCount() { return tryOnCount; }
    public void setTryOnCount(int tryOnCount) { this.tryOnCount = tryOnCount; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
}
