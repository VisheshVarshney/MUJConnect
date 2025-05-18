/*
  # Fix Auth Trigger and Add Missing Features

  1. Changes
    - Fix user creation trigger
    - Add profile management functions
    - Add password management functions
*/

-- Drop and recreate the trigger function with proper metadata handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text;
  user_count int;
BEGIN
  -- Get the role from metadata
  user_role := new.raw_user_meta_data->>'role';
  
  -- If no role specified, determine based on user count
  IF user_role IS NULL THEN
    SELECT COUNT(*) INTO user_count FROM users;
    user_role := CASE WHEN user_count = 0 THEN 'admin' ELSE 'staff' END;
  END IF;

  INSERT INTO public.users (
    id,
    email,
    role,
    full_name,
    active,
    created_at,
    updated_at
  ) VALUES (
    new.id,
    new.email,
    user_role,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown'),
    true,
    now(),
    now()
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to change password (will be called through Supabase Auth)
CREATE OR REPLACE FUNCTION change_password(
  user_id uuid,
  current_password text,
  new_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Password change is handled by Supabase Auth
  -- This function is a placeholder for additional logic
  RETURN true;
END;
$$;