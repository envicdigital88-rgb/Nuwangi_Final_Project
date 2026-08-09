package com.virtualtryonsaas.service;

import com.virtualtryonsaas.dto.SizeRecommendationResponse;
import com.virtualtryonsaas.entity.BodyProfile;
import com.virtualtryonsaas.entity.Product;
import com.virtualtryonsaas.repository.BodyProfileRepository;
import com.virtualtryonsaas.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SizeRecommendationService {

    @Autowired
    private BodyProfileRepository bodyProfileRepository;

    @Autowired
    private ProductRepository productRepository;

    public SizeRecommendationResponse recommendSize(UUID userId, UUID productId) {
        // Get body profile
        BodyProfile profile = bodyProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Body profile not found. Please create your body profile first."));

        // Get product
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        return getRuleBasedRecommendation(profile, product);
    }

    private SizeRecommendationResponse getRuleBasedRecommendation(BodyProfile profile, Product product) {
        Integer height = profile.getHeightCm() != null ? profile.getHeightCm() : 170;
        Double chest = profile.getChestCm() != null ? profile.getChestCm() : 90.0;
        Double waist = profile.getWaistCm() != null ? profile.getWaistCm() : 80.0;
        
        String size;
        String[] alternatives;
        
        // Simple rule-based sizing
        if (chest < 85 && waist < 70) {
            size = "S";
            alternatives = new String[]{"XS", "M"};
        } else if (chest < 95 && waist < 80) {
            size = "M";
            alternatives = new String[]{"S", "L"};
        } else if (chest < 105 && waist < 90) {
            size = "L";
            alternatives = new String[]{"M", "XL"};
        } else {
            size = "XL";
            alternatives = new String[]{"L", "XXL"};
        }
        
        String explanation = String.format(
            "Based on your measurements (Chest: %.0fcm, Waist: %.0fcm, Height: %dcm), " +
            "we recommend size %s for the best fit.",
            chest, waist, height, size
        );
        
        return new SizeRecommendationResponse(size, "High", explanation, alternatives);
    }
}
