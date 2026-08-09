package com.virtualtryonsaas.dto;

import java.util.UUID;

public class VirtualTryOnResponse {
    private UUID sessionId;
    private String avatarWithClothingUrl;
    private String resultImageUrl;
    private String threeDModelUrl;
    private Double confidenceScore;
    private String fitFeedback;
    private String recommendedSize;
    private Boolean success;
    private String message;

    public VirtualTryOnResponse() {}

    public VirtualTryOnResponse(Boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // Getters and Setters
    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

    public String getAvatarWithClothingUrl() { return avatarWithClothingUrl; }
    public void setAvatarWithClothingUrl(String avatarWithClothingUrl) { this.avatarWithClothingUrl = avatarWithClothingUrl; }

    public String getResultImageUrl() { return resultImageUrl; }
    public void setResultImageUrl(String resultImageUrl) { this.resultImageUrl = resultImageUrl; }

    public String getThreeDModelUrl() { return threeDModelUrl; }
    public void setThreeDModelUrl(String threeDModelUrl) { this.threeDModelUrl = threeDModelUrl; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getFitFeedback() { return fitFeedback; }
    public void setFitFeedback(String fitFeedback) { this.fitFeedback = fitFeedback; }

    public String getRecommendedSize() { return recommendedSize; }
    public void setRecommendedSize(String recommendedSize) { this.recommendedSize = recommendedSize; }

    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}