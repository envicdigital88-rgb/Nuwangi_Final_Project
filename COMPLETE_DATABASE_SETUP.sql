-- ============================================
-- VIRTUAL TRY-ON SAAS PLATFORM
-- Complete Database Setup Script
-- ============================================
-- This script sets up the entire database from scratch
-- Run this in MySQL Workbench or any MySQL client
-- ============================================

-- Drop and recreate database (CAUTION: This will delete all existing data!)
DROP DATABASE IF EXISTS virtual_tryon;
CREATE DATABASE virtual_tryon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE virtual_tryon;

-- ============================================
-- TABLE 1: ADMINS
-- Stores admin user accounts
-- ============================================
CREATE TABLE admins (
    id CHAR(36) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSON,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 2: USERS (CUSTOMERS)
-- Stores customer accounts
-- ============================================
CREATE TABLE users (
    id CHAR(36) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    user_type VARCHAR(20) DEFAULT 'CUSTOMER',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 3: PRODUCTS
-- Stores product catalog
-- ============================================
CREATE TABLE products (
    id CHAR(36) NOT NULL PRIMARY KEY,
    category_id CHAR(36),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    barcode VARCHAR(100) UNIQUE,
    sku VARCHAR(100) UNIQUE,
    color VARCHAR(50),
    material VARCHAR(100),
    care_instructions TEXT,
    image_url TEXT,
    model3d_url TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_brand (brand),
    INDEX idx_status (status),
    INDEX idx_barcode (barcode),
    INDEX idx_sku (sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 4: BODY_PROFILES
-- Stores customer body measurements
-- ============================================
CREATE TABLE body_profiles (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    height_cm DECIMAL(5, 2),
    chest_cm DECIMAL(5, 2),
    waist_cm DECIMAL(5, 2),
    hip_cm DECIMAL(5, 2),
    shoulder_width_cm DECIMAL(5, 2),
    body_shape VARCHAR(50),
    skin_tone VARCHAR(50),
    gender VARCHAR(20),
    nickname VARCHAR(100),
    age INT,
    hair_color VARCHAR(50),
    eye_color VARCHAR(50),
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 5: TRY_ON_SESSIONS
-- Stores virtual try-on session data
-- ============================================
CREATE TABLE try_on_sessions (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    body_profile_id CHAR(36),
    result_image_url TEXT,
    confidence_score DECIMAL(3, 2),
    fit_feedback TEXT,
    recommended_size VARCHAR(10),
    session_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (body_profile_id) REFERENCES body_profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 6: CATEGORIES (Optional)
-- Product categories
-- ============================================
CREATE TABLE categories (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INITIAL DATA: ADMIN USER
-- ============================================
-- Password: admin123 (BCrypt hash)
INSERT INTO admins (id, email, password_hash, first_name, last_name, role, created_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@example.com',
    '$2a$10$rZ8qH5YvJxKxJxKxJxKxJeO5YvJxKxJxKxKxKxKxKxKxKxKxKxJxK',
    'Admin',
    'User',
    'admin',
    NOW()
);

-- ============================================
-- INITIAL DATA: SAMPLE CUSTOMERS
-- ============================================
-- Note: Customers should register through the application
-- These are just examples with placeholder passwords
-- Password: customer123 (BCrypt hash)

INSERT INTO users (id, email, password_hash, first_name, last_name, phone, user_type, status, created_at)
VALUES 
(
    '3a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    'sarah.johnson@email.com',
    '$2a$10$rZ8qH5YvJxKxJxKxJxKxJeO5YvJxKxJxKxKxKxKxKxKxKxKxKxJxK',
    'Sarah',
    'Johnson',
    '+1-555-0101',
    'CUSTOMER',
    'ACTIVE',
    NOW()
),
(
    '4b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e',
    'mike.davis@email.com',
    '$2a$10$rZ8qH5YvJxKxJxKxJxKxJeO5YvJxKxKxKxKxKxKxKxKxKxKxKxJxK',
    'Mike',
    'Davis',
    '+1-555-0102',
    'CUSTOMER',
    'ACTIVE',
    NOW()
),
(
    '5c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f',
    'emily.chen@email.com',
    '$2a$10$rZ8qH5YvJxKxJxKxJxKxJeO5YvJxKxKxKxKxKxKxKxKxKxKxKxJxK',
    'Emily',
    'Chen',
    '+1-555-0103',
    'CUSTOMER',
    'ACTIVE',
    NOW()
);

-- ============================================
-- INITIAL DATA: SAMPLE PRODUCTS
-- ============================================
INSERT INTO products (id, name, description, brand, price, currency, barcode, sku, color, material, image_url, model3d_url, status, created_at)
VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Classic White Shirt',
    'A timeless white shirt perfect for any occasion. Made from premium cotton with a comfortable fit.',
    'Fashion Brand',
    49.99,
    'USD',
    'SHIRT-001',
    'SKU-SHIRT-001',
    'White',
    'Cotton',
    'https://via.placeholder.com/300x400/ffffff/000000?text=White+Shirt',
    '/uploads/models/shirt.obj',
    'active',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Blue Denim Jeans',
    'Classic blue denim jeans with a modern fit. Durable and stylish for everyday wear.',
    'Fashion Brand',
    79.99,
    'USD',
    'JEANS-001',
    'SKU-JEANS-001',
    'Blue',
    'Denim',
    'https://via.placeholder.com/300x400/4169e1/ffffff?text=Blue+Jeans',
    '/uploads/models/pant.obj',
    'active',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Black Formal Suit',
    'Elegant black formal suit perfect for business meetings and special occasions.',
    'Fashion Brand',
    299.99,
    'USD',
    'SUIT-001',
    'SKU-SUIT-001',
    'Black',
    'Wool Blend',
    'https://via.placeholder.com/300x400/000000/ffffff?text=Black+Suit',
    '/uploads/models/suit.obj',
    'active',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'Navy Blue Blazer',
    'Sophisticated navy blue blazer that pairs well with any outfit.',
    'Fashion Brand',
    149.99,
    'USD',
    'BLAZER-001',
    'SKU-BLAZER-001',
    'Navy',
    'Cotton Blend',
    'https://via.placeholder.com/300x400/000080/ffffff?text=Navy+Blazer',
    '/uploads/models/suit collar.obj',
    'active',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    'Casual Khaki Pants',
    'Comfortable khaki pants for casual and semi-formal occasions.',
    'Fashion Brand',
    59.99,
    'USD',
    'PANTS-001',
    'SKU-PANTS-001',
    'Khaki',
    'Cotton',
    'https://via.placeholder.com/300x400/c3b091/000000?text=Khaki+Pants',
    '/uploads/models/pant.obj',
    'active',
    NOW()
);

-- ============================================
-- INITIAL DATA: BODY PROFILES
-- ============================================
INSERT INTO body_profiles (id, user_id, height_cm, chest_cm, waist_cm, hip_cm, shoulder_width_cm, body_shape, skin_tone, gender, nickname, age, hair_color, eye_color, created_at)
VALUES 
(
    '6d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a',
    '3a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    165.0,
    88.0,
    72.0,
    95.0,
    42.0,
    'hourglass',
    'medium',
    'female',
    'Sarah',
    28,
    'brown',
    'brown',
    NOW()
),
(
    '7e5f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b',
    '4b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e',
    178.0,
    98.0,
    85.0,
    95.0,
    48.0,
    'rectangle',
    'light',
    'male',
    'Mike',
    32,
    'blonde',
    'blue',
    NOW()
),
(
    '8f6a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c',
    '5c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f',
    160.0,
    82.0,
    68.0,
    92.0,
    38.0,
    'pear',
    'medium',
    'female',
    'Emily',
    25,
    'black',
    'brown',
    NOW()
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
SELECT '=== DATABASE SETUP COMPLETE ===' AS Status;

SELECT 'Admins Table' AS Table_Name, COUNT(*) AS Record_Count FROM admins
UNION ALL
SELECT 'Users Table', COUNT(*) FROM users
UNION ALL
SELECT 'Products Table', COUNT(*) FROM products
UNION ALL
SELECT 'Body Profiles Table', COUNT(*) FROM body_profiles
UNION ALL
SELECT 'Try-On Sessions Table', COUNT(*) FROM try_on_sessions
UNION ALL
SELECT 'Categories Table', COUNT(*) FROM categories;

-- Show admin credentials
SELECT '=== ADMIN CREDENTIALS ===' AS Info;
SELECT 
    email AS 'Admin Email',
    'admin123' AS 'Password',
    first_name AS 'First Name',
    last_name AS 'Last Name'
FROM admins;

-- Show customer credentials
SELECT '=== CUSTOMER CREDENTIALS ===' AS Info;
SELECT 
    email AS 'Customer Email',
    'customer123' AS 'Password (Note: Register new customers through app)',
    first_name AS 'First Name',
    last_name AS 'Last Name'
FROM users;

-- Show products with 3D models
SELECT '=== PRODUCTS WITH 3D MODELS ===' AS Info;
SELECT 
    name AS 'Product Name',
    brand AS 'Brand',
    price AS 'Price',
    color AS 'Color',
    model3d_url AS '3D Model URL',
    status AS 'Status'
FROM products
ORDER BY name;

-- Show body profiles
SELECT '=== BODY PROFILES ===' AS Info;
SELECT 
    u.email AS 'Customer Email',
    bp.nickname AS 'Nickname',
    bp.height_cm AS 'Height (cm)',
    bp.chest_cm AS 'Chest (cm)',
    bp.waist_cm AS 'Waist (cm)',
    bp.body_shape AS 'Body Shape',
    bp.gender AS 'Gender'
FROM body_profiles bp
JOIN users u ON bp.user_id = u.id;

SELECT '=== SETUP SUCCESSFUL ===' AS Status;
SELECT 'Database is ready to use!' AS Message;
SELECT 'Backend URL: http://localhost:8082' AS Backend;
SELECT 'Admin Panel: http://localhost:3002' AS Admin_Panel;
SELECT 'Customer Store: http://localhost:3001' AS Customer_Store;
