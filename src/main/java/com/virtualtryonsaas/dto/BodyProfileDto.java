package com.virtualtryonsaas.dto;

import java.util.UUID;
import java.time.LocalDateTime;

public class BodyProfileDto {
    private UUID id;
    private UUID userId;
    private Integer heightCm;
    private Double weightKg;
    private Double chestCm;
    private Double waistCm;
    private Double hipCm;
    private Double shoulderWidthCm;
    private String bodyShape;
    private String skinTone;
    private String gender;
    private String nickname;
    private Integer age;
    private String hairColor;
    private String hairStyle;
    private String eyeColor;
    private String profileImageUrl;
    private String faceImageUrl;
    private String avatarModelUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BodyProfileDto() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public Integer getHeightCm() { return heightCm; }
    public void setHeightCm(Integer heightCm) { this.heightCm = heightCm; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public Double getChestCm() { return chestCm; }
    public void setChestCm(Double chestCm) { this.chestCm = chestCm; }

    public Double getWaistCm() { return waistCm; }
    public void setWaistCm(Double waistCm) { this.waistCm = waistCm; }

    public Double getHipCm() { return hipCm; }
    public void setHipCm(Double hipCm) { this.hipCm = hipCm; }

    public Double getShoulderWidthCm() { return shoulderWidthCm; }
    public void setShoulderWidthCm(Double shoulderWidthCm) { this.shoulderWidthCm = shoulderWidthCm; }

    public String getBodyShape() { return bodyShape; }
    public void setBodyShape(String bodyShape) { this.bodyShape = bodyShape; }

    public String getSkinTone() { return skinTone; }
    public void setSkinTone(String skinTone) { this.skinTone = skinTone; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getHairColor() { return hairColor; }
    public void setHairColor(String hairColor) { this.hairColor = hairColor; }

    public String getHairStyle() { return hairStyle; }
    public void setHairStyle(String hairStyle) { this.hairStyle = hairStyle; }

    public String getEyeColor() { return eyeColor; }
    public void setEyeColor(String eyeColor) { this.eyeColor = eyeColor; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public String getFaceImageUrl() { return faceImageUrl; }
    public void setFaceImageUrl(String faceImageUrl) { this.faceImageUrl = faceImageUrl; }

    public String getAvatarModelUrl() { return avatarModelUrl; }
    public void setAvatarModelUrl(String avatarModelUrl) { this.avatarModelUrl = avatarModelUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}