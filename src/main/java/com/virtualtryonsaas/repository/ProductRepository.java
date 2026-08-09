package com.virtualtryonsaas.repository;

import com.virtualtryonsaas.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    
    Optional<Product> findByBarcode(String barcode);
    
    Optional<Product> findBySku(String sku);
    
    boolean existsByBarcode(String barcode);
    
    boolean existsBySku(String sku);
}