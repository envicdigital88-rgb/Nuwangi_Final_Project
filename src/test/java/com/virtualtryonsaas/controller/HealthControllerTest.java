package com.virtualtryonsaas.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class HealthControllerTest {

    private final HealthController healthController = new HealthController();

    @Test
    @DisplayName("Health endpoint returns status UP and service name")
    void testHealthEndpoint() {
        ResponseEntity<Map<String, String>> response = healthController.health();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("UP", response.getBody().get("status"));
        assertEquals("virtual-tryon-backend", response.getBody().get("service"));
    }
}
