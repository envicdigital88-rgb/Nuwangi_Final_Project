package com.virtualtryonsaas.repository;

import com.virtualtryonsaas.entity.BodyProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BodyProfileRepository extends JpaRepository<BodyProfile, UUID> {
    
    Optional<BodyProfile> findByUserId(UUID userId);
    
    boolean existsByUserId(UUID userId);
}