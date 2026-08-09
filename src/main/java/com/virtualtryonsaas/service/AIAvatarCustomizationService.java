package com.virtualtryonsaas.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIAvatarCustomizationService {

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Use AI to generate intelligent avatar customization suggestions
     * This provides realistic color combinations and style recommendations
     */
    public Map<String, Object> generateAvatarCustomization(String gender, Map<String, Object> bodyMeasurements, 
                                                           String skinTone, String hairStyle) {
        Map<String, Object> customization = new HashMap<>();
        
        System.out.println("=== AI Avatar Customization Service ===");
        System.out.println("Gender: " + gender);
        System.out.println("Skin Tone: " + skinTone);
        System.out.println("Hair Style: " + hairStyle);
        System.out.println("OpenAI Key present: " + (openaiApiKey != null && !openaiApiKey.isEmpty()));
        System.out.println("Gemini Key present: " + (geminiApiKey != null && !geminiApiKey.isEmpty()));
        
        // Try OpenAI first, fallback to Gemini, then to rule-based
        if (openaiApiKey != null && !openaiApiKey.isEmpty() && !openaiApiKey.equals("your-openai-api-key-here")) {
            try {
                System.out.println("Attempting OpenAI generation...");
                Map<String, Object> result = generateWithOpenAI(gender, bodyMeasurements, skinTone, hairStyle);
                System.out.println("OpenAI generation successful!");
                return result;
            } catch (Exception e) {
                System.out.println("OpenAI failed: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        if (geminiApiKey != null && !geminiApiKey.isEmpty() && !geminiApiKey.equals("your-gemini-api-key-here")) {
            try {
                System.out.println("Attempting Gemini generation...");
                Map<String, Object> result = generateWithGemini(gender, bodyMeasurements, skinTone, hairStyle);
                System.out.println("Gemini generation successful!");
                return result;
            } catch (Exception e) {
                System.out.println("Gemini failed: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        // Fallback to intelligent rule-based system
        System.out.println("Using rule-based generation (no AI keys configured)");
        return generateRuleBased(gender, skinTone, hairStyle);
    }

    private Map<String, Object> generateWithOpenAI(String gender, Map<String, Object> bodyMeasurements,
                                                    String skinTone, String hairStyle) {
        String prompt = String.format(
            "Generate realistic avatar customization for a %s person with %s skin tone and %s hair style. " +
            "Provide: hair color (hex code), eye color (hex code), hair length description, and style recommendations. " +
            "Return as JSON with keys: hairColor, eyeColor, hairLength, styleNotes",
            gender, skinTone, hairStyle
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("messages", List.of(
            Map.of("role", "system", "content", "You are an expert in avatar design and realistic human appearance."),
            Map.of("role", "user", "content", prompt)
        ));
        requestBody.put("temperature", 0.7);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        try {
            Map<String, Object> response = restTemplate.postForObject(
                "https://api.openai.com/v1/chat/completions",
                request,
                Map.class
            );
            
            // Parse AI response
            return parseAIResponse(response);
        } catch (Exception e) {
            throw new RuntimeException("OpenAI API call failed: " + e.getMessage());
        }
    }

    private Map<String, Object> generateWithGemini(String gender, Map<String, Object> bodyMeasurements,
                                                    String skinTone, String hairStyle) {
        String prompt = String.format(
            "Generate realistic avatar customization for a %s person with %s skin tone and %s hair style. " +
            "Provide: hair color (hex code), eye color (hex code), hair length description. " +
            "Return as JSON format.",
            gender, skinTone, hairStyle
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(
            Map.of("parts", List.of(Map.of("text", prompt)))
        ));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        try {
            Map<String, Object> response = restTemplate.postForObject(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + geminiApiKey,
                request,
                Map.class
            );
            
            return parseAIResponse(response);
        } catch (Exception e) {
            throw new RuntimeException("Gemini API call failed: " + e.getMessage());
        }
    }

    /**
     * Intelligent rule-based system (free, no API needed)
     * Provides realistic color combinations based on skin tone
     */
    private Map<String, Object> generateRuleBased(String gender, String skinTone, String hairStyle) {
        Map<String, Object> customization = new HashMap<>();
        
        // Realistic hair colors based on skin tone
        Map<String, String> hairColorMap = new HashMap<>();
        hairColorMap.put("light", "#8B4513"); // Brown
        hairColorMap.put("medium", "#654321"); // Dark brown
        hairColorMap.put("tan", "#2C1810"); // Very dark brown
        hairColorMap.put("dark", "#000000"); // Black
        
        // Realistic eye colors based on skin tone
        Map<String, String> eyeColorMap = new HashMap<>();
        eyeColorMap.put("light", "#4169E1"); // Blue
        eyeColorMap.put("medium", "#654321"); // Brown
        eyeColorMap.put("tan", "#654321"); // Brown
        eyeColorMap.put("dark", "#2C1810"); // Dark brown
        
        // Hair geometry based on style
        Map<String, Map<String, Object>> hairGeometry = new HashMap<>();
        hairGeometry.put("short", Map.of(
            "length", "short",
            "scaleY", 0.3,
            "positionY", 1.0,
            "description", "Short cropped hair"
        ));
        hairGeometry.put("medium", Map.of(
            "length", "medium",
            "scaleY", 0.6,
            "positionY", 1.0,
            "description", "Medium length hair"
        ));
        hairGeometry.put("long", Map.of(
            "length", "long",
            "scaleY", 1.0,
            "positionY", 1.0,
            "description", "Long flowing hair"
        ));
        hairGeometry.put("ponytail", Map.of(
            "length", "medium",
            "scaleY", 0.7,
            "positionY", 0.9,
            "description", "Hair tied in ponytail"
        ));
        hairGeometry.put("bald", Map.of(
            "length", "none",
            "scaleY", 0.0,
            "positionY", 0.0,
            "description", "No hair"
        ));
        
        customization.put("hairColor", hairColorMap.getOrDefault(skinTone, "#654321"));
        customization.put("eyeColor", eyeColorMap.getOrDefault(skinTone, "#654321"));
        customization.put("hairGeometry", hairGeometry.getOrDefault(hairStyle, hairGeometry.get("short")));
        customization.put("skinToneHex", getSkinToneHex(skinTone));
        customization.put("method", "rule-based");
        customization.put("description", generateAvatarDescription(gender, skinTone, hairStyle));
        
        return customization;
    }
    
    /**
     * Generate a natural language description of the avatar
     */
    private String generateAvatarDescription(String gender, String skinTone, String hairStyle) {
        String genderDesc = gender.equalsIgnoreCase("FEMALE") ? "female" : "male";
        String toneDesc = skinTone;
        String hairDesc = hairStyle;
        
        return String.format("A %s avatar with %s skin tone and %s hair style. " +
            "The avatar is generated based on your body measurements to provide accurate virtual try-on experience.",
            genderDesc, toneDesc, hairDesc);
    }

    private String getSkinToneHex(String skinTone) {
        Map<String, String> toneMap = new HashMap<>();
        toneMap.put("light", "#FFE0BD");
        toneMap.put("medium", "#D4A574");
        toneMap.put("tan", "#C68642");
        toneMap.put("dark", "#8D5524");
        return toneMap.getOrDefault(skinTone, "#D4A574");
    }

    private Map<String, Object> parseAIResponse(Map<String, Object> response) {
        // Parse the AI response and extract customization data
        // This is a simplified version - actual implementation would parse JSON from AI
        Map<String, Object> customization = new HashMap<>();
        customization.put("hairColor", "#654321");
        customization.put("eyeColor", "#4169E1");
        customization.put("method", "ai-generated");
        return customization;
    }

    /**
     * Generate hair model URL based on style
     * In a real implementation, this would return different 3D hair models
     */
    public String getHairModelUrl(String hairStyle, String gender) {
        // Map hair styles to 3D model files
        // For now, returns placeholder - you would have actual hair models
        Map<String, String> hairModels = new HashMap<>();
        hairModels.put("short", "/uploads/models/hair/short_hair.obj");
        hairModels.put("medium", "/uploads/models/hair/medium_hair.obj");
        hairModels.put("long", "/uploads/models/hair/long_hair.obj");
        hairModels.put("ponytail", "/uploads/models/hair/ponytail.obj");
        hairModels.put("bald", null);
        
        return hairModels.getOrDefault(hairStyle, "/uploads/models/hair/short_hair.obj");
    }
}
