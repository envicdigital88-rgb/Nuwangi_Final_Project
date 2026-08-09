package com.virtualtryonsaas.repository;

import com.virtualtryonsaas.entity.Admin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminRepository extends JpaRepository<Admin, UUID> {
    
    Optional<Admin> findByEmail(String email);
    
    boolean existsByEmail(String email);
}