package com.virtualtryonsaas.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Access Denied. Please log in again.");
        error.put("type", ex.getClass().getSimpleName());
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN); // Or UNAUTHORIZED so frontend intercepts it
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        error.put("type", ex.getClass().getSimpleName());
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex, WebRequest request) {
        System.err.println("=== EXCEPTION CAUGHT ===");
        System.err.println("Exception Type: " + ex.getClass().getName());
        System.err.println("Message: " + ex.getMessage());
        System.err.println("Stack Trace:");
        ex.printStackTrace();
        System.err.println("=== END EXCEPTION ===");
        
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        error.put("type", ex.getClass().getSimpleName());
        
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
