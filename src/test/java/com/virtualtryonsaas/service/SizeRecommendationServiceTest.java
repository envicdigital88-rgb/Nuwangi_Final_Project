package com.virtualtryonsaas.service;

import com.virtualtryonsaas.dto.SizeRecommendationResponse;
import com.virtualtryonsaas.entity.BodyProfile;
import com.virtualtryonsaas.entity.Product;
import com.virtualtryonsaas.repository.BodyProfileRepository;
import com.virtualtryonsaas.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SizeRecommendationServiceTest {

    @Mock
    private BodyProfileRepository bodyProfileRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private SizeRecommendationService sizeRecommendationService;

    private UUID userId;
    private UUID productId;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        productId = UUID.randomUUID();
        testProduct = new Product();
        testProduct.setId(productId);
        testProduct.setName("Casual Shirt");
    }

    @Test
    @DisplayName("Recommend Size S for slim measurements")
    void testRecommendSize_Small() {
        BodyProfile profile = new BodyProfile();
        profile.setHeightCm(165);
        profile.setChestCm(82.0);
        profile.setWaistCm(68.0);

        when(bodyProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));

        SizeRecommendationResponse response = sizeRecommendationService.recommendSize(userId, productId);

        assertNotNull(response);
        assertEquals("S", response.getRecommendedSize());
        assertEquals("High", response.getConfidence());
        assertTrue(response.getExplanation().contains("size S"));
    }

    @Test
    @DisplayName("Recommend Size M for medium measurements")
    void testRecommendSize_Medium() {
        BodyProfile profile = new BodyProfile();
        profile.setHeightCm(172);
        profile.setChestCm(92.0);
        profile.setWaistCm(78.0);

        when(bodyProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));

        SizeRecommendationResponse response = sizeRecommendationService.recommendSize(userId, productId);

        assertNotNull(response);
        assertEquals("M", response.getRecommendedSize());
        assertEquals("High", response.getConfidence());
    }

    @Test
    @DisplayName("Recommend Size L for standard large measurements")
    void testRecommendSize_Large() {
        BodyProfile profile = new BodyProfile();
        profile.setHeightCm(178);
        profile.setChestCm(102.0);
        profile.setWaistCm(88.0);

        when(bodyProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));

        SizeRecommendationResponse response = sizeRecommendationService.recommendSize(userId, productId);

        assertNotNull(response);
        assertEquals("L", response.getRecommendedSize());
        assertEquals("High", response.getConfidence());
    }

    @Test
    @DisplayName("Recommend Size XL for extra large measurements")
    void testRecommendSize_ExtraLarge() {
        BodyProfile profile = new BodyProfile();
        profile.setHeightCm(185);
        profile.setChestCm(115.0);
        profile.setWaistCm(98.0);

        when(bodyProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));

        SizeRecommendationResponse response = sizeRecommendationService.recommendSize(userId, productId);

        assertNotNull(response);
        assertEquals("XL", response.getRecommendedSize());
        assertEquals("High", response.getConfidence());
    }

    @Test
    @DisplayName("Throws exception when body profile not found")
    void testRecommendSize_NoProfile_ThrowsException() {
        when(bodyProfileRepository.findByUserId(userId)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            sizeRecommendationService.recommendSize(userId, productId);
        });

        assertTrue(exception.getMessage().contains("Body profile not found"));
    }
}
