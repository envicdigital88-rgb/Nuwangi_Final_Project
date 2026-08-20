package com.virtualtryonsaas.service;

import com.virtualtryonsaas.dto.CustomerLoginRequest;
import com.virtualtryonsaas.dto.CustomerRegisterRequest;
import com.virtualtryonsaas.dto.LoginResponse;
import com.virtualtryonsaas.entity.User;
import com.virtualtryonsaas.repository.UserRepository;
import com.virtualtryonsaas.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CustomerAuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private BodyProfileService bodyProfileService;

    @InjectMocks
    private CustomerAuthService customerAuthService;

    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("sarah.johnson@email.com");
        testUser.setPasswordHash("encoded_password_hash");
        testUser.setFirstName("Sarah");
        testUser.setLastName("Johnson");
        testUser.setUserType("CUSTOMER");
        testUser.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("Customer registration success")
    void testRegister_Success() {
        CustomerRegisterRequest request = new CustomerRegisterRequest();
        request.setEmail("newuser@email.com");
        request.setPassword("password123");
        request.setFirstName("Jane");
        request.setLastName("Doe");

        when(userRepository.findByEmail("newuser@email.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });
        when(jwtTokenProvider.generateToken(any(), eq("CUSTOMER"), eq("newuser@email.com"))).thenReturn("mock_jwt_token");

        LoginResponse response = customerAuthService.register(request);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getToken());
        assertEquals("newuser@email.com", response.getEmail());
        assertNotNull(response.getCustomer());
        assertEquals("newuser@email.com", response.getCustomer().getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Customer registration duplicate email throws exception")
    void testRegister_EmailAlreadyExists() {
        CustomerRegisterRequest request = new CustomerRegisterRequest();
        request.setEmail("sarah.johnson@email.com");
        request.setPassword("password123");

        when(userRepository.findByEmail("sarah.johnson@email.com")).thenReturn(Optional.of(testUser));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            customerAuthService.register(request);
        });

        assertTrue(exception.getMessage().contains("Email already registered"));
    }

    @Test
    @DisplayName("Customer login success")
    void testLogin_Success() {
        CustomerLoginRequest request = new CustomerLoginRequest();
        request.setEmail("sarah.johnson@email.com");
        request.setPassword("customer123");

        when(userRepository.findByEmail("sarah.johnson@email.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("customer123", "encoded_password_hash")).thenReturn(true);
        when(jwtTokenProvider.generateToken(userId, "CUSTOMER", "sarah.johnson@email.com")).thenReturn("mock_jwt_token");

        LoginResponse response = customerAuthService.login(request);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getToken());
        assertEquals("sarah.johnson@email.com", response.getEmail());
        assertNotNull(response.getCustomer());
        assertEquals("sarah.johnson@email.com", response.getCustomer().getEmail());
        verify(jwtTokenProvider, times(1)).generateToken(userId, "CUSTOMER", "sarah.johnson@email.com");
    }

    @Test
    @DisplayName("Customer login with incorrect password throws exception")
    void testLogin_InvalidPassword() {
        CustomerLoginRequest request = new CustomerLoginRequest();
        request.setEmail("sarah.johnson@email.com");
        request.setPassword("wrongpassword");

        when(userRepository.findByEmail("sarah.johnson@email.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpassword", "encoded_password_hash")).thenReturn(false);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            customerAuthService.login(request);
        });

        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    @DisplayName("Customer login with unknown email throws exception")
    void testLogin_UserNotFound() {
        CustomerLoginRequest request = new CustomerLoginRequest();
        request.setEmail("unknown@email.com");
        request.setPassword("somepassword");

        when(userRepository.findByEmail("unknown@email.com")).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            customerAuthService.login(request);
        });

        assertEquals("Invalid email or password", exception.getMessage());
    }
}
