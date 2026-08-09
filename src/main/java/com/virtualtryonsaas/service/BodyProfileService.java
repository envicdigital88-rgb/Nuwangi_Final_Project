package com.virtualtryonsaas.service;

import com.virtualtryonsaas.dto.BodyProfileDto;
import com.virtualtryonsaas.entity.BodyProfile;
import com.virtualtryonsaas.repository.BodyProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.UUID;

@Service
public class BodyProfileService {

    @Autowired
    private BodyProfileRepository bodyProfileRepository;

    @Autowired
    private AIService aiService;

    public BodyProfileDto getUserBodyProfile(UUID userId) {
        try {
            BodyProfile profile = bodyProfileRepository.findByUserId(userId)
                .orElse(null);
            
            if (profile == null) {
                // Return null instead of throwing exception - let frontend handle this
                return null;
            }
            
            return convertToDto(profile);
        } catch (Exception e) {
            // Log error but don't throw - let frontend handle gracefully
            System.err.println("Error fetching body profile: " + e.getMessage());
            return null;
        }
    }

    public BodyProfileDto createBodyProfile(BodyProfileDto profileDto) {
        // Check if profile already exists for this user
        BodyProfile existingProfile = bodyProfileRepository.findByUserId(profileDto.getUserId())
            .orElse(null);
        
        BodyProfile profile;
        if (existingProfile != null) {
            // Update existing profile
            profile = existingProfile;
        } else {
            // Create new profile
            profile = new BodyProfile();
            profile.setUserId(profileDto.getUserId());
        }
        
        // Set all fields
        profile.setHeightCm(profileDto.getHeightCm());
        profile.setWeightKg(profileDto.getWeightKg());
        profile.setChestCm(profileDto.getChestCm());
        profile.setWaistCm(profileDto.getWaistCm());
        profile.setHipCm(profileDto.getHipCm());
        profile.setShoulderWidthCm(profileDto.getShoulderWidthCm());
        profile.setBodyShape(profileDto.getBodyShape());
        profile.setSkinTone(profileDto.getSkinTone());
        profile.setGender(profileDto.getGender());
        profile.setNickname(profileDto.getNickname());
        profile.setAge(profileDto.getAge());
        profile.setHairColor(profileDto.getHairColor());
        profile.setEyeColor(profileDto.getEyeColor());
        profile.setProfileImageUrl(profileDto.getProfileImageUrl());
        profile.setFaceImageUrl(profileDto.getFaceImageUrl());
        
        profile = bodyProfileRepository.save(profile);
        return convertToDto(profile);
    }

    public BodyProfileDto updateBodyProfile(UUID id, BodyProfileDto profileDto) {
        BodyProfile profile = bodyProfileRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Body profile not found"));
        
        profile.setHeightCm(profileDto.getHeightCm());
        profile.setWeightKg(profileDto.getWeightKg());
        profile.setChestCm(profileDto.getChestCm());
        profile.setWaistCm(profileDto.getWaistCm());
        profile.setHipCm(profileDto.getHipCm());
        profile.setShoulderWidthCm(profileDto.getShoulderWidthCm());
        profile.setBodyShape(profileDto.getBodyShape());
        profile.setSkinTone(profileDto.getSkinTone());
        profile.setGender(profileDto.getGender());
        profile.setNickname(profileDto.getNickname());
        profile.setAge(profileDto.getAge());
        profile.setHairColor(profileDto.getHairColor());
        profile.setEyeColor(profileDto.getEyeColor());
        profile.setProfileImageUrl(profileDto.getProfileImageUrl());
        profile.setFaceImageUrl(profileDto.getFaceImageUrl());
        
        profile = bodyProfileRepository.save(profile);
        return convertToDto(profile);
    }

    public BodyProfileDto analyzePhotoAndCreateProfile(MultipartFile photo, UUID userId) {
        try {
            // Convert photo to base64
            byte[] photoBytes = photo.getBytes();
            String base64Photo = Base64.getEncoder().encodeToString(photoBytes);
            
            // Analyze photo using AI service
            String measurementsJson = aiService.analyzeBodyMeasurements(base64Photo);
            
            // Parse measurements (simplified - in production would use proper JSON parsing)
            BodyProfile profile = new BodyProfile();
            profile.setUserId(userId);
            
            // Mock measurements extraction (in production, parse from AI response)
            profile.setHeightCm(165);
            profile.setChestCm(88.0);
            profile.setWaistCm(72.0);
            profile.setHipCm(95.0);
            profile.setShoulderWidthCm(42.0);
            profile.setBodyShape("hourglass");
            profile.setSkinTone("medium");
            
            // Store photo URL (in production, upload to cloud storage)
            profile.setProfileImageUrl("data:image/jpeg;base64," + base64Photo.substring(0, 100) + "...");
            
            profile = bodyProfileRepository.save(profile);
            return convertToDto(profile);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze photo: " + e.getMessage());
        }
    }

    public String uploadAvatarPhoto(MultipartFile photo, UUID userId) {
        try {
            // In production, upload to cloud storage (AWS S3, etc.)
            // For now, return a mock URL
            return "https://storage.example.com/avatars/" + userId + "/" + photo.getOriginalFilename();
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload photo: " + e.getMessage());
        }
    }

    private BodyProfileDto convertToDto(BodyProfile profile) {
        BodyProfileDto dto = new BodyProfileDto();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUserId());
        dto.setHeightCm(profile.getHeightCm());
        dto.setWeightKg(profile.getWeightKg());
        dto.setChestCm(profile.getChestCm());
        dto.setWaistCm(profile.getWaistCm());
        dto.setHipCm(profile.getHipCm());
        dto.setShoulderWidthCm(profile.getShoulderWidthCm());
        dto.setBodyShape(profile.getBodyShape());
        dto.setSkinTone(profile.getSkinTone());
        dto.setGender(profile.getGender());
        dto.setNickname(profile.getNickname());
        dto.setAge(profile.getAge());
        dto.setHairColor(profile.getHairColor());
        dto.setHairStyle(profile.getHairStyle());
        dto.setEyeColor(profile.getEyeColor());
        dto.setProfileImageUrl(profile.getProfileImageUrl());
        dto.setFaceImageUrl(profile.getFaceImageUrl());
        dto.setAvatarModelUrl(profile.getAvatarModelUrl());
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());
        return dto;
    }
}