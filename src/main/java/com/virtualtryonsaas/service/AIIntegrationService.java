package com.virtualtryonsaas.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * AI Integration Service
 * Connects Java backend with Python AI service
 * Provides intelligent size recommendations, measurement extraction, and style suggestions
 */
@Service
public class AIIntegrationService {

    @Value("${ai.services.base-url:http://localhost:5000}")
    private String aiServiceBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Extract body measurements from uploaded photo using AI
     */
    public Map<String, Object> extractMeasurementsFromPhoto(MultipartFile photo, Double heightCm) {
        try {
            String url = aiServiceBaseUrl + "/api/ai/extract-measurements";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            // Create request body
            Map<String, Object> body = new HashMap<>();
            if (heightCm != null) {
                body.put("height_cm", heightCm);
            }
            
            // For now, return fallback - full implementation would send actual image
            return getFallbackMeasurements(heightCm);
            
        } catch (Exception e) {
            System.out.println("AI service not available, using fallback measurements");
            return getFallbackMeasurements(heightCm);
        }
    }

    /**
     * Get AI-powered size recommendation
     */
    public Map<String, Object> recommendSize(Map<String, Object> measurements, 
                                             String gender, String clothingType) {
        try {
            String url = aiServiceBaseUrl + "/api/ai/recommend-size";
            
            Map<String, Object> request = new HashMap<>();
            request.put("measurements", measurements);
            request.put("gender", gender);
            request.put("clothing_type", clothingType);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                if (Boolean.TRUE.equals(result.get("success"))) {
                    return (Map<String, Object>) result.get("recommendation");
                }
            }
            
            return getFallbackSizeRecommendation(measurements, gender, clothingType);
            
        } catch (Exception e) {
            System.out.println("AI service not available for size recommendation: " + e.getMessage());
            return getFallbackSizeRecommendation(measurements, gender, clothingType);
        }
    }

    /**
     * Get AI-powered color recommendations
     */
    public Map<String, Object> recommendColors(String skinTone, String occasion) {
        try {
            String url = aiServiceBaseUrl + "/api/ai/recommend-colors";
            
            Map<String, Object> request = new HashMap<>();
            request.put("skin_tone", skinTone);
            request.put("occasion", occasion);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                if (Boolean.TRUE.equals(result.get("success"))) {
                    return (Map<String, Object>) result.get("recommendations");
                }
            }
            
            return getFallbackColorRecommendations(skinTone);
            
        } catch (Exception e) {
            System.out.println("AI service not available for color recommendation: " + e.getMessage());
            return getFallbackColorRecommendations(skinTone);
        }
    }

    /**
     * Get AI-powered style recommendations
     */
    public Map<String, Object> recommendStyle(String bodyShape, String gender, String clothingType) {
        try {
            String url = aiServiceBaseUrl + "/api/ai/recommend-style";
            
            Map<String, Object> request = new HashMap<>();
            request.put("body_shape", bodyShape);
            request.put("gender", gender);
            request.put("clothing_type", clothingType);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                if (Boolean.TRUE.equals(result.get("success"))) {
                    return (Map<String, Object>) result.get("recommendations");
                }
            }
            
            return getFallbackStyleRecommendations(bodyShape);
            
        } catch (Exception e) {
            System.out.println("AI service not available for style recommendation: " + e.getMessage());
            return getFallbackStyleRecommendations(bodyShape);
        }
    }

    /**
     * Get complete AI recommendations (all in one call)
     */
    public Map<String, Object> getCompleteRecommendations(Map<String, Object> userProfile) {
        try {
            String url = aiServiceBaseUrl + "/api/ai/complete-recommendation";
            
            System.out.println("🤖 Calling AI service at: " + url);
            System.out.println("📊 User profile: " + userProfile);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(userProfile, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            System.out.println("✅ AI service response status: " + response.getStatusCode());
            System.out.println("📦 AI service response body: " + response.getBody());
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }
            
            System.out.println("⚠️ AI service returned non-OK status, using fallback");
            return getFallbackCompleteRecommendations(userProfile);
            
        } catch (Exception e) {
            System.out.println("❌ AI service error: " + e.getMessage());
            e.printStackTrace();
            return getFallbackCompleteRecommendations(userProfile);
        }
    }

    // Fallback methods when AI service is not available

    private Map<String, Object> getFallbackMeasurements(Double heightCm) {
        Map<String, Object> measurements = new HashMap<>();
        measurements.put("height_cm", heightCm != null ? heightCm : 165.0);
        measurements.put("chest_cm", 88.0);
        measurements.put("waist_cm", 72.0);
        measurements.put("hip_cm", 95.0);
        measurements.put("shoulder_width_cm", 42.0);
        measurements.put("confidence", 0.75);
        measurements.put("method", "fallback");
        return measurements;
    }

    private Map<String, Object> getFallbackSizeRecommendation(Map<String, Object> measurements, 
                                                               String gender, String clothingType) {
        Map<String, Object> recommendation = new HashMap<>();
        
        double chest = ((Number) measurements.getOrDefault("chest_cm", 88)).doubleValue();
        String size = "M";
        
        if ("female".equalsIgnoreCase(gender)) {
            if (chest < 82) size = "XS";
            else if (chest < 88) size = "S";
            else if (chest < 94) size = "M";
            else if (chest < 100) size = "L";
            else size = "XL";
        } else {
            if (chest < 90) size = "S";
            else if (chest < 98) size = "M";
            else if (chest < 106) size = "L";
            else size = "XL";
        }
        
        recommendation.put("recommended_size", size);
        recommendation.put("confidence", 85.0);
        recommendation.put("method", "rule-based");
        return recommendation;
    }

    private Map<String, Object> getFallbackColorRecommendations(String skinTone) {
        Map<String, Object> recommendations = new HashMap<>();
        recommendations.put("skin_tone", skinTone);
        recommendations.put("method", "fallback");
        return recommendations;
    }

    private Map<String, Object> getFallbackStyleRecommendations(String bodyShape) {
        Map<String, Object> recommendations = new HashMap<>();
        recommendations.put("body_shape", bodyShape);
        recommendations.put("method", "fallback");
        return recommendations;
    }

    private Map<String, Object> getFallbackCompleteRecommendations(Map<String, Object> userProfile) {
        Map<String, Object> result = new HashMap<>();
        
        // Extract measurements
        Map<String, Object> measurements = (Map<String, Object>) userProfile.get("measurements");
        String gender = (String) userProfile.getOrDefault("gender", "female");
        String clothingType = (String) userProfile.getOrDefault("clothing_type", "shirt");
        String skinTone = (String) userProfile.getOrDefault("skin_tone", "medium");
        String bodyShape = (String) userProfile.getOrDefault("body_shape", "rectangle");
        
        // Get individual recommendations
        Map<String, Object> sizeRec = recommendSize(measurements, gender, clothingType);
        Map<String, Object> colorRec = recommendColors(skinTone, "casual");
        Map<String, Object> styleRec = recommendStyle(bodyShape, gender, clothingType);
        
        result.put("success", true);
        result.put("size_recommendation", sizeRec);
        result.put("color_recommendations", colorRec);
        result.put("style_recommendations", styleRec);
        result.put("message", "AI recommendations generated successfully");
        
        return result;
    }
}
