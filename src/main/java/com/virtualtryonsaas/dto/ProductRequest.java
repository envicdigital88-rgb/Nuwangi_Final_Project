package com.virtualtryonsaas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public class ProductRequest {
    @NotBlank(message = "Product name is required")
    private String name;

    private String description;
    private String brand;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    private String barcode;
    private String sku;
    private String color;
    private String material;
    private String careInstructions;
    private String imageUrl;
    private String model3dUrl;
    private UUID categoryId;
    private String category;
    private String sizeChart;
    private String availableSizes;

    // Constructors
    public ProductRequest() {}

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getCareInstructions() { return careInstructions; }
    public void setCareInstructions(String careInstructions) { this.careInstructions = careInstructions; }

    public UUID getCategoryId() { return categoryId; }
    public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getModel3dUrl() { return model3dUrl; }
    public void setModel3dUrl(String model3dUrl) { this.model3dUrl = model3dUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSizeChart() { return sizeChart; }
    public void setSizeChart(String sizeChart) { this.sizeChart = sizeChart; }

    public String getAvailableSizes() { return availableSizes; }
    public void setAvailableSizes(String availableSizes) { this.availableSizes = availableSizes; }
}