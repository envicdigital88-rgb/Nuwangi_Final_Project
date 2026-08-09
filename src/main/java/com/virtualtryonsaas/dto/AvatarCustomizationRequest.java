package com.virtualtryonsaas.dto;

import java.util.UUID;

public class AvatarCustomizationRequest {
    private UUID userId;
    private String skinTone;
    private String hairColor;
    private String hairStyle;
    private String eyeColor;
    private String faceShape;
    private String bodyShape;

    public AvatarCustomizationRequest() {}

    // Getters and Setters
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getSkinTone() { return skinTone; }
    public void setSkinTone(String skinTone) { this.skinTone = skinTone; }

    public String getHairColor() { return hairColor; }
    public void setHairColor(String hairColor) { this.hairColor = hairColor; }

    public String getHairStyle() { return hairStyle; }
    public void setHairStyle(String hairStyle) { this.hairStyle = hairStyle; }

    public String getEyeColor() { return eyeColor; }
    public void setEyeColor(String eyeColor) { this.eyeColor = eyeColor; }

    public String getFaceShape() { return faceShape; }
    public void setFaceShape(String faceShape) { this.faceShape = faceShape; }

    public String getBodyShape() { return bodyShape; }
    public void setBodyShape(String bodyShape) { this.bodyShape = bodyShape; }
}
