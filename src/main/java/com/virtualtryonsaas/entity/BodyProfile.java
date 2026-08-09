package com.virtualtryonsaas.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "body_profiles")
@EntityListeners(AuditingEntityListener.class)
public class BodyProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "height_cm")
    private Integer heightCm;
    
    @Column(name = "weight_kg")
    private Double weightKg;
    
    @Column(name = "chest_cm")
    private Double chestCm;
    
    @Column(name = "waist_cm")
    private Double waistCm;
    
    @Column(name = "hip_cm")
    private Double hipCm;
    
    @Column(name = "shoulder_width_cm")
    private Double shoulderWidthCm;
    
    @Column(name = "body_shape")
    private String bodyShape;
    
    @Column(name = "skin_tone")
    private String skinTone;
    
    @Column(name = "gender")
    private String gender;
    
    @Column(name = "nickname")
    private String nickname;
    
    @Column(name = "age")
    private Integer age;
    
    @Column(name = "hair_color")
    private String hairColor;
    
    @Column(name = "hair_style")
    private String hairStyle;
    
    @Column(name = "eye_color")
    private String eyeColor;
    
    @Column(name = "profile_image_url", columnDefinition = "TEXT")
    private String profileImageUrl;
    
    @Column(name = "face_image_url", columnDefinition = "TEXT")
    private String faceImageUrl;
    
    @Column(name = "avatar_model_url", columnDefinition = "TEXT")
    private String avatarModelUrl;
    
    @Column(name = "body_landmarks", columnDefinition = "JSON")
    private String bodyLandmarks;
    
    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public BodyProfile() {}

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

    public String getBodyLandmarks() { return bodyLandmarks; }
    public void setBodyLandmarks(String bodyLandmarks) { this.bodyLandmarks = bodyLandmarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}