package com.virtualtryonsaas.controller;

import com.virtualtryonsaas.service.AIIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * AI Recommendation Controller
 * Provides AI-powered recommendations for virtual try-on
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3002", "http://localhost:5000"}, maxAge = 3600, allowCredentials = "true")
public class AIRecommendationController {

    @Autowired
    private AIIntegrationService aiIntegrationService;

    /**
     * Extract body measurements from photo using AI
     */
    @PostMapping("/extract-measurements")
    public ResponseEntity<Map<String, Object>> extractMeasurements(
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "height_cm", required = false) Double heightCm) {
        
        try {
            Map<String, Object> measurements = aiIntegrationService.extractMeasurementsFromPhoto(
                photo, heightCm
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("measurements", measurements);
            response.put("message", "Measurements extracted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get AI-powered size recommendation
     */
    @PostMapping("/recommend-size")
    public ResponseEntity<Map<String, Object>> recommendSize(@RequestBody Map<String, Object> request) {
        try {
            Map<String, Object> measurements = (Map<String, Object>) request.get("measurements");
            String gender = (String) request.getOrDefault("gender", "female");
            String clothingType = (String) request.getOrDefault("clothing_type", "shirt");
            
            Map<String, Object> recommendation = aiIntegrationService.recommendSize(
                measurements, gender, clothingType
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recommendation", recommendation);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get AI-powered color recommendations
     */
    @PostMapping("/recommend-colors")
    public ResponseEntity<Map<String, Object>> recommendColors(@RequestBody Map<String, Object> request) {
        try {
            String skinTone = (String) request.getOrDefault("skin_tone", "medium");
            String occasion = (String) request.getOrDefault("occasion", "casual");
            
            Map<String, Object> recommendations = aiIntegrationService.recommendColors(
                skinTone, occasion
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recommendations", recommendations);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get AI-powered style recommendations
     */
    @PostMapping("/recommend-style")
    public ResponseEntity<Map<String, Object>> recommendStyle(@RequestBody Map<String, Object> request) {
        try {
            String bodyShape = (String) request.getOrDefault("body_shape", "rectangle");
            String gender = (String) request.getOrDefault("gender", "female");
            String clothingType = (String) request.getOrDefault("clothing_type", "shirt");
            
            Map<String, Object> recommendations = aiIntegrationService.recommendStyle(
                bodyShape, gender, clothingType
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("recommendations", recommendations);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get complete AI recommendations (all features in one call)
     */
    @PostMapping("/complete-recommendations")
    public ResponseEntity<Map<String, Object>> getCompleteRecommendations(
            @RequestBody Map<String, Object> userProfile) {
        try {
            Map<String, Object> recommendations = aiIntegrationService.getCompleteRecommendations(
                userProfile
            );
            
            return ResponseEntity.ok(recommendations);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Health check for AI service
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("service", "AI Recommendation Service");
        health.put("features", new String[]{
            "Body Measurement Extraction",
            "Size Recommendation",
            "Color Recommendation",
            "Style Recommendation"
        });
        return ResponseEntity.ok(health);
    }
}
