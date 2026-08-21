-- ============================================
-- CREATE SUPER ADMIN USER
-- ============================================
-- This script creates a super admin account
-- Run this in MySQL Workbench or any MySQL client
-- ============================================

USE virtual_tryon;

-- Delete existing admin if exists
DELETE FROM admins WHERE email = 'superadmin@virtualtry.com';

-- Create Super Admin
-- Email: superadmin@virtualtry.com
-- Password: SuperAdmin@123
-- BCrypt hash for: SuperAdmin@123
INSERT INTO admins (id, email, password_hash, first_name, last_name, role, permissions, created_at)
VALUES (
    UUID(),
    'superadmin@virtualtry.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Super',
    'Admin',
    'super_admin',
    '{"all": true, "manage_admins": true, "manage_users": true, "manage_products": true, "manage_settings": true}',
    NOW()
);

-- Also create/update the default admin account
DELETE FROM admins WHERE email = 'admin@virtualtry.com';

INSERT INTO admins (id, email, password_hash, first_name, last_name, role, permissions, created_at)
VALUES (
    UUID(),
    'admin@virtualtry.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Admin',
    'User',
    'admin',
    '{"manage_users": true, "manage_products": true}',
    NOW()
);

-- Verification
SELECT '=== ADMIN ACCOUNTS CREATED ===' AS Status;

SELECT 
    email AS 'Email',
    CASE 
        WHEN email = 'superadmin@virtualtry.com' THEN 'SuperAdmin@123'
        WHEN email = 'admin@virtualtry.com' THEN 'SuperAdmin@123'
    END AS 'Password',
    first_name AS 'First Name',
    last_name AS 'Last Name',
    role AS 'Role',
    created_at AS 'Created At'
FROM admins
ORDER BY created_at DESC;

SELECT '=== INSTRUCTIONS ===' AS Info;
SELECT 'Super Admin Login:' AS Step, 'http://localhost:3002' AS URL, 'superadmin@virtualtry.com' AS Email, 'SuperAdmin@123' AS Password
UNION ALL
SELECT 'Regular Admin Login:', 'http://localhost:3002', 'admin@virtualtry.com', 'SuperAdmin@123';

