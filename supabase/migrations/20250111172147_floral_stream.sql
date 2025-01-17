/*
  # Add Superadmin and Notifications

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text)
      - `content` (text)
      - `is_read` (boolean)
      - `created_at` (timestamp)

  2. Changes
    - Add `is_superadmin` to profiles table
    - Add `settings` JSONB to profiles table
    - Add `post_settings` JSONB to posts table

  3. Security
    - Enable RLS on new tables
    - Add policies for notifications
    - Add superadmin policies
*/

-- Add superadmin and settings columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "email_notifications": true,
  "show_activity": true,
  "theme": "light"
}'::jsonb;

-- Add post settings
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS post_settings JSONB DEFAULT '{
  "show_likes": true,
  "allow_comments": true
}'::jsonb;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_superadmin = true
    )
  );

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_superadmin = true
    )
  );

-- Create superadmin function
CREATE OR REPLACE FUNCTION create_superadmin(
  p_email TEXT,
  p_password TEXT,
  p_username TEXT,
  p_full_name TEXT
) RETURNS void AS $$
BEGIN
  -- Create the user in auth.users
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data
  )
  VALUES (
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    format('{"full_name":"%s"}', p_full_name)::jsonb
  )
  ON CONFLICT (email) DO NOTHING;

  -- Get the user id
  WITH new_user AS (
    SELECT id FROM auth.users WHERE email = p_email LIMIT 1
  )
  -- Create the profile
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    is_superadmin
  )
  SELECT
    id,
    p_username,
    p_full_name,
    true
  FROM new_user
  ON CONFLICT (id) DO UPDATE
  SET is_superadmin = true;
END;
$$ LANGUAGE plpgsql;