/*
  # Fix RLS Policies

  1. Changes
    - Remove recursive RLS policies
    - Add proper role-based access control
    - Fix user creation flow
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;

-- Create new non-recursive policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow first user creation"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (NOT EXISTS (SELECT 1 FROM users));

-- Update the handle_new_user function to properly set roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_count int;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  
  INSERT INTO public.users (id, email, role, full_name, active)
  VALUES (
    new.id,
    new.email,
    CASE 
      WHEN user_count = 0 THEN 'admin'  -- First user is admin
      ELSE 'staff'                      -- Subsequent users are staff
    END,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown'),
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;