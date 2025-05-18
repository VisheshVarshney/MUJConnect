/*
  # Add Superadmin Support

  1. Changes
    - Add is_superadmin column to users table
    - Set default value to false
    - Update existing users
*/

-- Add is_superadmin column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_superadmin boolean DEFAULT false;

-- Update handle_new_user function to include is_superadmin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    created_at,
    is_superadmin
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    NOW(),
    COALESCE(NEW.raw_user_meta_data->>'is_superadmin', 'false')::boolean
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;