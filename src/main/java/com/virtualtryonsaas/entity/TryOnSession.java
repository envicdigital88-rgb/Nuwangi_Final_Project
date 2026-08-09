package com.virtualtryonsaas.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "try_on_sessions")
@EntityListeners(AuditingEntityListener.class)
public class TryOnSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "product_id", nullable = false)
    private UUID productId;
    
    @Column(name = "variant_id")
    private UUID variantId;
    
    @Column(name = "session_duration_seconds")
    private Integer sessionDurationSeconds;
    
    @Column(name = "result_image_url", columnDefinition = "TEXT")
    private String resultImageUrl;
    
    @Column(name = "avatar_with_clothing_url", columnDefinition = "TEXT")
    private String avatarWithClothingUrl;
    
    @Column(name = "fit_feedback")
    private String fitFeedback;
    
    @Column(name = "confidence_score")
    private Double confidenceScore;
    
    @Column(name = "liked")
    private Boolean liked = false;
    
    @Column(name = "shared")
    private Boolean shared = false;
    
    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Constructors
    public TryOnSession() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }

    public UUID getVariantId() { return variantId; }
    public void setVariantId(UUID variantId) { this.variantId = variantId; }

    public Integer getSessionDurationSeconds() { return sessionDurationSeconds; }
    public void setSessionDurationSeconds(Integer sessionDurationSeconds) { this.sessionDurationSeconds = sessionDurationSeconds; }

    public String getResultImageUrl() { return resultImageUrl; }
    public void setResultImageUrl(String resultImageUrl) { this.resultImageUrl = resultImageUrl; }

    public String getAvatarWithClothingUrl() { return avatarWithClothingUrl; }
    public void setAvatarWithClothingUrl(String avatarWithClothingUrl) { this.avatarWithClothingUrl = avatarWithClothingUrl; }

    public String getFitFeedback() { return fitFeedback; }
    public void setFitFeedback(String fitFeedback) { this.fitFeedback = fitFeedback; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public Boolean getLiked() { return liked; }
    public void setLiked(Boolean liked) { this.liked = liked; }

    public Boolean getShared() { return shared; }
    public void setShared(Boolean shared) { this.shared = shared; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}