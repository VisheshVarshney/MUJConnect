/*
  # Remove role column from users table

  1. Changes
    - Remove role column from users table
    - Remove role-based RLS policies
    - Add basic RLS policies for user management

  2. Security
    - Enable RLS on users table
    - Add policies for basic user management
*/

-- Remove role column and related policies
ALTER TABLE public.users 
DROP COLUMN IF EXISTS role;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;

-- Add new policies for user management
CREATE POLICY "Allow users to read their own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow users to delete their own data"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);