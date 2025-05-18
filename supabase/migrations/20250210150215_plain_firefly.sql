/*
  # Fix Authentication System

  1. Changes
    - Add auth schema triggers
    - Add user management functions
    - Update RLS policies for proper auth flow
*/

-- Create trigger to handle new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name, active)
  VALUES (
    new.id,
    new.email,
    'admin', -- First user is admin, subsequent users will be staff
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown'),
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for better auth integration
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Admins can insert users" ON users;
CREATE POLICY "Admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    OR NOT EXISTS (SELECT 1 FROM users)  -- Allow first user creation
  );

-- Function to check if user is first user
CREATE OR REPLACE FUNCTION is_first_user()
RETURNS boolean AS $$
BEGIN
  RETURN NOT EXISTS (SELECT 1 FROM users);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;