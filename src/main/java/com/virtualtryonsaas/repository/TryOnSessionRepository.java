package com.virtualtryonsaas.repository;

import com.virtualtryonsaas.entity.TryOnSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TryOnSessionRepository extends JpaRepository<TryOnSession, UUID> {
    
    List<TryOnSession> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    Page<TryOnSession> findByUserId(UUID userId, Pageable pageable);
    
    long countByUserId(UUID userId);
}