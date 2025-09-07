/*
  # Fix username uniqueness constraint
  
  1. Changes
    - Remove UNIQUE constraint from username column
    - Add case-insensitive unique index on lower(username)
    - This prevents database errors from case-sensitivity mismatches
  
  2. Security
    - Maintains username uniqueness enforcement
    - Aligns with check_username_availability function behavior
*/

-- Remove the existing unique constraint on username
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_username_key;

-- Create a case-insensitive unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_username_lower_idx 
ON user_profiles (lower(username));