DELETE FROM users;

INSERT INTO users (id, email, password_hash, first_name, last_name, phone, created_at, updated_at) VALUES
(UUID(), 'demo@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Demo', 'User', '1112223333', NOW(), NOW()),
(UUID(), 'customer1@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'John', 'Doe', '1234567890', NOW(), NOW()),
(UUID(), 'customer2@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Jane', 'Smith', '0987654321', NOW(), NOW()),
(UUID(), 'customer3@test.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Mike', 'Johnson', '5551234567', NOW(), NOW());
