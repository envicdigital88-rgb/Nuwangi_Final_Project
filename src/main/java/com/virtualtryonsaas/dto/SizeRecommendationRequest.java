package com.virtualtryonsaas.dto;

import java.util.UUID;

public class SizeRecommendationRequest {
    private UUID userId;
    private UUID productId;

    public SizeRecommendationRequest() {}

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }
}
