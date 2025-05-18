/*
  # IP Logging System

  1. New Tables
    - `ip_logs`
      - `id` (uuid, primary key)
      - `ip_address` (text)
      - `user_id` (uuid, references profiles, nullable)
      - `location` (jsonb)
      - `device_info` (jsonb)
      - `page_visited` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Only superadmins can view logs
*/

CREATE TABLE IF NOT EXISTS public.ip_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  location JSONB NOT NULL DEFAULT '{}',
  device_info JSONB NOT NULL DEFAULT '{}',
  page_visited TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ip_logs ENABLE ROW LEVEL SECURITY;

-- Only superadmins can view logs
CREATE POLICY "Only superadmins can view IP logs"
  ON public.ip_logs FOR SELECT
  USING (public.is_superadmin(auth.uid()));

-- Create function to log IP
CREATE OR REPLACE FUNCTION public.log_ip_visit(
  p_ip_address TEXT,
  p_user_id UUID,
  p_location JSONB,
  p_device_info JSONB,
  p_page_visited TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.ip_logs (
    ip_address,
    user_id,
    location,
    device_info,
    page_visited
  )
  VALUES (
    p_ip_address,
    p_user_id,
    p_location,
    p_device_info,
    p_page_visited
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;