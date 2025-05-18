/*
  # Fix Users Table and Sample Data

  1. Changes
    - Add updated_at column to users table
    - Fix sample data insertion order
    - Add profile update function
*/

-- Add updated_at column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Function to update user profile
CREATE OR REPLACE FUNCTION update_user_profile(
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
  -- Check if the user exists and is active
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_id AND active = true) THEN
    RAISE EXCEPTION 'User not found or inactive';
  END IF;

  -- Update the user profile
  UPDATE users
  SET 
    full_name = new_full_name,
    updated_at = now()
  WHERE id = user_id
  RETURNING * INTO updated_user;

  RETURN updated_user;
END;
$$;

-- Insert sample users if they don't exist
DO $$ 
BEGIN
  -- Insert admin user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@ttms.com') THEN
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
    );

    INSERT INTO public.users (id, email, role, full_name, active)
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      'admin@ttms.com',
      'admin',
      'System Administrator',
      true
    );
  END IF;

  -- Insert staff user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'staff@ttms.com') THEN
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
    );

    INSERT INTO public.users (id, email, role, full_name, active)
    VALUES (
      '00000000-0000-0000-0000-000000000002',
      'staff@ttms.com',
      'staff',
      'Staff Member',
      true
    );
  END IF;
END $$;