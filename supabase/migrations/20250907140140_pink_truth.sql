/*
  # Add is_out_of_stock column to products table

  1. Changes
    - Add `is_out_of_stock` boolean column to products table with default false
    - Update existing products to have is_out_of_stock = false by default
  
  2. Security
    - No RLS changes needed as this is just adding a column to existing table
*/

-- Add the is_out_of_stock column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_out_of_stock boolean DEFAULT false;

-- Update existing products to have is_out_of_stock = false
UPDATE products 
SET is_out_of_stock = false 
WHERE is_out_of_stock IS NULL;