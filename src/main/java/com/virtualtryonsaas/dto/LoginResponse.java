package com.virtualtryonsaas.dto;

import java.util.UUID;

public class LoginResponse {
    private String token;
    private String tokenType = "Bearer";
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private CustomerDto customer; // For customer login
    private BodyProfileDto bodyProfile; // Customer's body profile

    public LoginResponse(String token, UUID userId, String email, String firstName, String lastName) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    // Constructor for customer login
    public LoginResponse(String token, CustomerDto customer) {
        this.token = token;
        this.customer = customer;
        this.userId = customer.getId();
        this.email = customer.getEmail();
        this.firstName = customer.getFirstName();
        this.lastName = customer.getLastName();
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public CustomerDto getCustomer() { return customer; }
    public void setCustomer(CustomerDto customer) { this.customer = customer; }

    public BodyProfileDto getBodyProfile() { return bodyProfile; }
    public void setBodyProfile(BodyProfileDto bodyProfile) { this.bodyProfile = bodyProfile; }
}