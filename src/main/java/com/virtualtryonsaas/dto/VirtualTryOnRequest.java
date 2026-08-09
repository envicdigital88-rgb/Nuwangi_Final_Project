package com.virtualtryonsaas.dto;

import java.util.UUID;

public class VirtualTryOnRequest {
    private UUID userId;
    private UUID productId;
    private UUID variantId;
    private String size;
    private String color;
    private Boolean generateAvatar = true;
    private Boolean use3DModel = true;

    public VirtualTryOnRequest() {}

    // Getters and Setters
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }

    public UUID getVariantId() { return variantId; }
    public void setVariantId(UUID variantId) { this.variantId = variantId; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Boolean getGenerateAvatar() { return generateAvatar; }
    public void setGenerateAvatar(Boolean generateAvatar) { this.generateAvatar = generateAvatar; }

    public Boolean getUse3DModel() { return use3DModel; }
    public void setUse3DModel(Boolean use3DModel) { this.use3DModel = use3DModel; }
}