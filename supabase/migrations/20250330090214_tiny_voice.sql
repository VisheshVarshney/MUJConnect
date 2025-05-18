/*
  # Fix Authentication System

  1. Changes
    - Drop and recreate auth tables with correct structure
    - Add proper triggers for user creation
    - Insert test users with correct password hashing
*/

-- First, clean up existing tables and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
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

-- Insert test users
DO $$
BEGIN
  -- Only insert if they don't exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@example.com') THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data
    ) VALUES (
      gen_random_uuid(),
      'test@example.com',
      crypt('password123', gen_salt('bf')),
      now(),
      '{"full_name": "Test User"}'::jsonb
    );
  END IF;
END $$;