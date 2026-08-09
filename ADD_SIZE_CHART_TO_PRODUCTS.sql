-- Add size chart and available sizes to products table
-- This allows each product to have its own size measurements

ALTER TABLE products 
ADD COLUMN category VARCHAR(100),
ADD COLUMN size_chart TEXT COMMENT 'JSON format: {"S": {"chest": 86, "waist": 68, "hip": 92}, "M": {...}}',
ADD COLUMN available_sizes VARCHAR(255) COMMENT 'Comma-separated: S,M,L,XL';

-- Update existing products with default size chart
UPDATE products 
SET category = 'shirt',
    available_sizes = 'XS,S,M,L,XL,XXL',
    size_chart = '{
        "XS": {"chest": 80, "waist": 64, "hip": 88},
        "S": {"chest": 86, "waist": 68, "hip": 92},
        "M": {"chest": 92, "waist": 74, "hip": 98},
        "L": {"chest": 98, "waist": 80, "hip": 104},
        "XL": {"chest": 106, "waist": 88, "hip": 112},
        "XXL": {"chest": 114, "waist": 96, "hip": 120}
    }'
WHERE category IS NULL;

-- Example: Add specific size chart for a dress
-- UPDATE products 
-- SET size_chart = '{
--     "S": {"chest": 84, "waist": 66, "hip": 90, "length": 95},
--     "M": {"chest": 90, "waist": 72, "hip": 96, "length": 97},
--     "L": {"chest": 96, "waist": 78, "hip": 102, "length": 99}
-- }',
-- available_sizes = 'S,M,L'
-- WHERE name = 'Summer Floral Dress';
