-- STEP 1: Disable safe update mode
SET SQL_SAFE_UPDATES = 0;

-- STEP 2: Add size chart columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS size_chart TEXT COMMENT 'JSON format: {"S": {"chest": 86, "waist": 68, "hip": 92}, "M": {...}}',
ADD COLUMN IF NOT EXISTS available_sizes VARCHAR(255) COMMENT 'Comma-separated: S,M,L,XL';

-- STEP 3: Update existing products with default size chart
UPDATE products 
SET category = 'shirt',
    available_sizes = 'XS,S,M,L,XL,XXL',
    size_chart = '{"XS": {"chest": 80, "waist": 64, "hip": 88}, "S": {"chest": 86, "waist": 68, "hip": 92}, "M": {"chest": 92, "waist": 74, "hip": 98}, "L": {"chest": 98, "waist": 80, "hip": 104}, "XL": {"chest": 106, "waist": 88, "hip": 112}, "XXL": {"chest": 114, "waist": 96, "hip": 120}}'
WHERE category IS NULL;

-- STEP 4: Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Done! Now restart your Java backend
