package com.virtualtryonsaas.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

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
