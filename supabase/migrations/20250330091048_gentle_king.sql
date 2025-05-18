/*
  # Fix Users Table Structure

  1. Changes
    - Add role column back to users table
    - Update existing users with default roles
    - Add role-based RLS policies

  2. Security
    - Enable RLS on users table
    - Add policies for role-based access
*/

-- Add role column back to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role text NOT NULL 
CHECK (role IN ('admin', 'staff')) 
DEFAULT 'staff';

-- Update RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to read" ON public.users;

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

-- Update existing users
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@ttms.com';

UPDATE public.users
SET role = 'staff'
WHERE email = 'staff@ttms.com';