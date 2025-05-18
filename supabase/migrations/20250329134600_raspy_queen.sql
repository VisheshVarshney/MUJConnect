/*
  # Authentication System Setup

  1. Changes
    - Add auth schema triggers and functions
    - Add example admin and staff users
    - Set up proper RLS policies

  2. New Data
    - Admin user (admin@ttms.com / admin123)
    - Staff user (staff@ttms.com / staff123)
*/

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create auth.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  encrypted_password text NOT NULL,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create public.users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'staff')),
  full_name text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text;
  user_count int;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;
  
  -- First user is admin, rest are staff
  user_role := CASE WHEN user_count = 0 THEN 'admin' ELSE 'staff' END;

  INSERT INTO public.users (
    id,
    email,
    role,
    full_name,
    active
  ) VALUES (
    new.id,
    new.email,
    user_role,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown'),
    true
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert example users
-- Admin user: admin@ttms.com / admin123
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@ttms.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"full_name": "System Administrator"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Staff user: staff@ttms.com / staff123
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'staff@ttms.com',
  crypt('staff123', gen_salt('bf')),
  now(),
  '{"full_name": "Staff Member"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert corresponding public user records
INSERT INTO public.users (id, email, role, full_name, active)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@ttms.com', 'admin', 'System Administrator', true),
  ('00000000-0000-0000-0000-000000000002', 'staff@ttms.com', 'staff', 'Staff Member', true)
ON CONFLICT (id) DO NOTHING;