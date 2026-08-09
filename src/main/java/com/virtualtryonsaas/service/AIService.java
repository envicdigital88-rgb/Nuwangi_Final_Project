package com.virtualtryonsaas.service;

import com.virtualtryonsaas.dto.VirtualTryOnRequest;
import com.virtualtryonsaas.dto.VirtualTryOnResponse;
import com.virtualtryonsaas.entity.BodyProfile;
import com.virtualtryonsaas.entity.Product;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class AIService {

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.api.url:https://api.openai.com/v1}")
    private String openaiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public VirtualTryOnResponse generateVirtualTryOn(BodyProfile bodyProfile, Product product, VirtualTryOnRequest request) {
        try {
            // For now, simulate AI processing with mock data
            // In production, this would call OpenAI DALL-E or custom AI model
            
            VirtualTryOnResponse response = new VirtualTryOnResponse();
            
            // Simulate AI processing delay
            Thread.sleep(2000);
            
            // Generate mock avatar with clothing URL
            String avatarUrl = generateMockAvatarWithClothing(bodyProfile, product);
            response.setAvatarWithClothingUrl(avatarUrl);
            response.setResultImageUrl(avatarUrl);
            
            // Calculate fit confidence based on measurements
            double confidence = calculateFitConfidence(bodyProfile, product);
            response.setConfidenceScore(confidence);
            
            // Generate fit feedback
            String feedback = generateFitFeedback(confidence);
            response.setFitFeedback(feedback);
            
            // Recommend size
            String recommendedSize = recommendSize(bodyProfile, product);
            response.setRecommendedSize(recommendedSize);
            
            response.setSuccess(true);
            response.setMessage("Virtual try-on completed successfully");
            
            return response;
            
        } catch (Exception e) {
            return new VirtualTryOnResponse(false, "AI processing failed: " + e.getMessage());
        }
    }

    private String generateMockAvatarWithClothing(BodyProfile bodyProfile, Product product) {
        // In production, this would generate actual 3D avatar with clothing
        // For now, return a placeholder URL that represents the avatar with clothing
        return String.format("https://api.readyplayer.me/v1/avatars/%s/clothing/%s.glb", 
            bodyProfile.getId().toString().substring(0, 8), 
            product.getId().toString().substring(0, 8));
    }

    private double calculateFitConfidence(BodyProfile bodyProfile, Product product) {
        // Simple fit calculation based on body measurements
        // In production, this would use advanced AI algorithms
        
        if (bodyProfile.getChestCm() == null || bodyProfile.getWaistCm() == null) {
            return 0.7; // Default confidence if measurements are missing
        }
        
        // Mock calculation - in reality this would be much more sophisticated
        double chestFit = Math.max(0, 1.0 - Math.abs(bodyProfile.getChestCm() - 90) / 20.0);
        double waistFit = Math.max(0, 1.0 - Math.abs(bodyProfile.getWaistCm() - 75) / 15.0);
        
        return Math.min(0.95, (chestFit + waistFit) / 2.0);
    }

    private String generateFitFeedback(double confidence) {
        if (confidence >= 0.9) {
            return "Excellent fit! This item should look great on you.";
        } else if (confidence >= 0.8) {
            return "Good fit! This item should work well for your body type.";
        } else if (confidence >= 0.7) {
            return "Decent fit. You might want to consider sizing options.";
        } else {
            return "This item might not be the best fit. Consider other options.";
        }
    }

    private String recommendSize(BodyProfile bodyProfile, Product product) {
        // Simple size recommendation logic
        // In production, this would use ML models trained on fit data
        
        if (bodyProfile.getChestCm() == null) {
            return "M"; // Default recommendation
        }
        
        double chest = bodyProfile.getChestCm();
        
        if (chest < 85) return "S";
        else if (chest < 95) return "M";
        else if (chest < 105) return "L";
        else return "XL";
    }

    public String analyzeBodyMeasurements(String imageBase64) {
        // This would call OpenAI Vision API to analyze body measurements from photos
        // For now, return mock measurements
        
        try {
            if (openaiApiKey == null || openaiApiKey.isEmpty()) {
                return generateMockMeasurements();
            }
            
            // In production, call OpenAI Vision API
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-4-vision-preview");
            requestBody.put("messages", new Object[]{
                Map.of("role", "user", 
                       "content", new Object[]{
                           Map.of("type", "text", "text", "Analyze this person's body measurements and return height, chest, waist, hip measurements in JSON format"),
                           Map.of("type", "image_url", "image_url", Map.of("url", "data:image/jpeg;base64," + imageBase64))
                       })
            });
            requestBody.put("max_tokens", 300);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                openaiApiUrl + "/chat/completions",
                HttpMethod.POST,
                entity,
                String.class
            );
            
            return response.getBody();
            
        } catch (Exception e) {
            return generateMockMeasurements();
        }
    }

    private String generateMockMeasurements() {
        return "{\n" +
               "  \"height_cm\": 165,\n" +
               "  \"chest_cm\": 88,\n" +
               "  \"waist_cm\": 72,\n" +
               "  \"hip_cm\": 95,\n" +
               "  \"shoulder_width_cm\": 42,\n" +
               "  \"body_shape\": \"hourglass\"\n" +
               "}";
    }
}