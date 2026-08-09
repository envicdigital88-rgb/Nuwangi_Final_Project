package com.virtualtryonsaas.dto;

public class SizeRecommendationResponse {
    private String recommendedSize;
    private String confidence;
    private String explanation;
    private String[] alternativeSizes;

    public SizeRecommendationResponse() {}

    public SizeRecommendationResponse(String recommendedSize, String confidence, String explanation, String[] alternativeSizes) {
        this.recommendedSize = recommendedSize;
        this.confidence = confidence;
        this.explanation = explanation;
        this.alternativeSizes = alternativeSizes;
    }

    public String getRecommendedSize() { return recommendedSize; }
    public void setRecommendedSize(String recommendedSize) { this.recommendedSize = recommendedSize; }

    public String getConfidence() { return confidence; }
    public void setConfidence(String confidence) { this.confidence = confidence; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String[] getAlternativeSizes() { return alternativeSizes; }
    public void setAlternativeSizes(String[] alternativeSizes) { this.alternativeSizes = alternativeSizes; }
}
