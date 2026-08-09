package com.virtualtryonsaas.dto;

public class AvatarResponse {
    private String avatarUrl;
    private String avatarModelUrl;
    private String bodyProportions;
    private String customizationData;

    public AvatarResponse() {}

    public AvatarResponse(String avatarUrl, String avatarModelUrl, String bodyProportions, String customizationData) {
        this.avatarUrl = avatarUrl;
        this.avatarModelUrl = avatarModelUrl;
        this.bodyProportions = bodyProportions;
        this.customizationData = customizationData;
    }

    // Getters and Setters
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getAvatarModelUrl() { return avatarModelUrl; }
    public void setAvatarModelUrl(String avatarModelUrl) { this.avatarModelUrl = avatarModelUrl; }

    public String getBodyProportions() { return bodyProportions; }
    public void setBodyProportions(String bodyProportions) { this.bodyProportions = bodyProportions; }

    public String getCustomizationData() { return customizationData; }
    public void setCustomizationData(String customizationData) { this.customizationData = customizationData; }
}
