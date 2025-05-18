/*
  # Fix Users Table Dependencies

  1. Changes
    - Drop dependent objects in correct order
    - Recreate users table with correct structure
    - Reestablish foreign key constraints
    - Update trigger function
*/

-- First, drop dependent objects in correct order
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_user_profile(uuid,text);

-- Drop foreign key constraints
ALTER TABLE IF EXISTS toll_passes
DROP CONSTRAINT IF EXISTS toll_passes_created_by_fkey;

ALTER TABLE IF EXISTS transactions
DROP CONSTRAINT IF EXISTS transactions_processed_by_fkey;

-- Now we can safely drop and recreate the users table
DROP TABLE IF EXISTS public.users;

-- Create users table with correct structure
CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_sign_in_at timestamptz
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy for authenticated users
CREATE POLICY "Allow authenticated users to read"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user handling
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recreate foreign key constraints
ALTER TABLE toll_passes
ADD CONSTRAINT toll_passes_created_by_fkey
FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE transactions
ADD CONSTRAINT transactions_processed_by_fkey
FOREIGN KEY (processed_by) REFERENCES users(id);

-- Recreate profile update function
CREATE OR REPLACE FUNCTION public.update_user_profile(
  user_id uuid,
  new_full_name text
)
RETURNS users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_user users;
BEGIN
  UPDATE users
  SET 
    full_name = new_full_name,
    last_sign_in_at = now()
  WHERE id = user_id
  RETURNING * INTO updated_user;

  RETURN updated_user;
END;
$$;