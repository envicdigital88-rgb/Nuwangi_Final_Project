-- ============================================
-- Add Avatar Preferences to Body Profile
-- ============================================
-- This script adds hair_style field to save complete avatar customization

USE virtual_tryon;

-- Add hair_style column if it doesn't exist
ALTER TABLE body_profiles 
ADD COLUMN IF NOT EXISTS hair_style VARCHAR(50) AFTER hair_color;

-- Verify the change
DESCRIBE body_profiles;

SELECT 'Avatar preferences fields added successfully!' AS Status;
SELECT 'Fields: skin_tone, hair_color, hair_style, eye_color' AS Available_Fields;
