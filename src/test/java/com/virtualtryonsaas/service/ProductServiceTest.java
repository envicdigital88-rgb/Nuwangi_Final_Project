package com.virtualtryonsaas.service;

import com.virtualtryonsaas.dto.ProductDto;
import com.virtualtryonsaas.dto.ProductRequest;
import com.virtualtryonsaas.entity.Product;
import com.virtualtryonsaas.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;
    private ProductRequest testRequest;
    private UUID productId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        testProduct = new Product();
        testProduct.setId(productId);
        testProduct.setName("Classic Polo Shirt");
        testProduct.setDescription("A high quality cotton polo");
        testProduct.setBrand("Polo Co");
        testProduct.setPrice(new BigDecimal("49.99"));
        testProduct.setBarcode("1234567890");
        testProduct.setColor("Blue, Red, White");
        testProduct.setCategory("shirt");
        testProduct.setStatus("AVAILABLE");

        testRequest = new ProductRequest();
        testRequest.setName("Classic Polo Shirt");
        testRequest.setDescription("A high quality cotton polo");
        testRequest.setBrand("Polo Co");
        testRequest.setPrice(new BigDecimal("49.99"));
        testRequest.setBarcode("1234567890");
        testRequest.setColor("Blue, Red, White");
        testRequest.setCategory("shirt");
        testRequest.setStatus("AVAILABLE");
    }

    @Test
    @DisplayName("Test get all products pagination")
    void testGetAllProducts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> productPage = new PageImpl<>(Collections.singletonList(testProduct));
        when(productRepository.findAll(pageable)).thenReturn(productPage);

        Page<ProductDto> result = productService.getAllProducts(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Classic Polo Shirt", result.getContent().get(0).getName());
        verify(productRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("Test get product by ID - success")
    void testGetProductById_Success() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));

        ProductDto result = productService.getProductById(productId);

        assertNotNull(result);
        assertEquals(productId, result.getId());
        assertEquals("Classic Polo Shirt", result.getName());
        verify(productRepository, times(1)).findById(productId);
    }

    @Test
    @DisplayName("Test get product by ID - not found")
    void testGetProductById_NotFound() {
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            productService.getProductById(productId);
        });

        assertEquals("Product not found", exception.getMessage());
        verify(productRepository, times(1)).findById(productId);
    }

    @Test
    @DisplayName("Test get product by barcode - success")
    void testGetProductByBarcode_Success() {
        when(productRepository.findByBarcode("1234567890")).thenReturn(Optional.of(testProduct));

        ProductDto result = productService.getProductByBarcode("1234567890");

        assertNotNull(result);
        assertEquals("1234567890", result.getBarcode());
        verify(productRepository, times(1)).findByBarcode("1234567890");
    }

    @Test
    @DisplayName("Test create product - success")
    void testCreateProduct_Success() {
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        ProductDto result = productService.createProduct(testRequest);

        assertNotNull(result);
        assertEquals("Classic Polo Shirt", result.getName());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Test update product - success")
    void testUpdateProduct_Success() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        testRequest.setName("Updated Polo Shirt");
        ProductDto result = productService.updateProduct(productId, testRequest);

        assertNotNull(result);
        verify(productRepository, times(1)).findById(productId);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Test delete product - success")
    void testDeleteProduct_Success() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        doNothing().when(productRepository).delete(testProduct);

        assertDoesNotThrow(() -> productService.deleteProduct(productId));
        verify(productRepository, times(1)).delete(testProduct);
    }
}
