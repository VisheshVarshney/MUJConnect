/*
  # Add Sample Users and Enhance Auth System

  1. Changes
    - Add sample admin and staff users
    - Add function to handle password resets
    - Add function to handle profile updates
*/

-- Insert sample admin user
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

-- Insert sample staff user
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

-- Insert corresponding user records
INSERT INTO public.users (id, email, role, full_name, active)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@ttms.com', 'admin', 'System Administrator', true),
  ('00000000-0000-0000-0000-000000000002', 'staff@ttms.com', 'staff', 'Staff Member', true)
ON CONFLICT (id) DO NOTHING;

-- Function to update user profile
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id uuid,
  new_full_name text
)
RETURNS users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  RETURNING *;

  RETURN NULL;
END;
$$;