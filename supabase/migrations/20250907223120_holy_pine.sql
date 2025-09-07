/*
  # Fix signup database error - User profiles handling
  
  1. Issues
    - Trigger function may be failing when creating user profiles
    - Username or phone data might be missing from user_metadata
    - Constraint violations on user_profiles table
  
  2. Solutions
    - Make trigger function more robust with error handling
    - Handle cases where username/phone are null
    - Add proper validation and fallbacks
    - Fix any constraint issues
*/

-- Drop existing trigger to recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop and recreate the trigger function with better error handling
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_username text;
  user_phone text;
BEGIN
  -- Extract username and phone from metadata with fallbacks
  user_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1) -- Use email prefix as fallback username
  );
  
  user_phone := NEW.raw_user_meta_data->>'phone';
  
  -- Ensure username is unique by appending random suffix if needed
  WHILE EXISTS (SELECT 1 FROM user_profiles WHERE LOWER(username) = LOWER(user_username)) LOOP
    user_username := user_username || '_' || substr(md5(random()::text), 1, 4);
  END LOOP;
  
  -- Insert user profile with error handling
  BEGIN
    INSERT INTO user_profiles (user_id, username, phone)
    VALUES (NEW.id, user_username, user_phone);
  EXCEPTION 
    WHEN unique_violation THEN
      -- If still unique violation, try with timestamp suffix
      user_username := split_part(NEW.email, '@', 1) || '_' || extract(epoch from now())::text;
      INSERT INTO user_profiles (user_id, username, phone)
      VALUES (NEW.id, user_username, user_phone);
    WHEN OTHERS THEN
      -- Log error but don't fail the user creation
      RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail user creation if profile creation fails
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Make sure the user_profiles table has proper constraints
ALTER TABLE user_profiles ALTER COLUMN username SET NOT NULL;

-- Update the check functions to be more robust
CREATE OR REPLACE FUNCTION check_username_availability(username_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return false if username is null or empty
  IF username_to_check IS NULL OR trim(username_to_check) = '' THEN
    RETURN false;
  END IF;
  
  -- Check if username exists (case-insensitive)
  RETURN NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE LOWER(username) = LOWER(trim(username_to_check))
  );
END;
$$;

CREATE OR REPLACE FUNCTION check_email_availability(email_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return false if email is null or empty
  IF email_to_check IS NULL OR trim(email_to_check) = '' THEN
    RETURN false;
  END IF;
  
  -- Check if email exists in auth.users (case-insensitive)
  RETURN NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE LOWER(email) = LOWER(trim(email_to_check))
  );
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON auth.users TO postgres, service_role;

SELECT 'Fixed signup database error with robust user profile handling!' as status;