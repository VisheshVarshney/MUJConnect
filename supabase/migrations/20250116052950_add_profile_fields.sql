/*
  # Add Profile Fields and Banner Storage

  1. Changes
    - Add address field to profiles table
    - Add is_hostel field to profiles table
    - Add hostel_block field to profiles table
    - Add banner_url field to profiles table
    - Create banners storage bucket
    - Add storage policies for banners
*/

-- Add new fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS is_hostel BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hostel_block TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Create storage bucket for banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Add storage policy for authenticated users
CREATE POLICY "Banner images are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'banners' );

CREATE POLICY "Anyone can upload a banner"
  ON storage.objects FOR INSERT 
  WITH CHECK ( bucket_id = 'banners' );

CREATE POLICY "Users can update own banner"
  ON storage.objects FOR UPDATE
  USING ( auth.uid() = owner );

CREATE POLICY "Users can delete own banner"
  ON storage.objects FOR DELETE
  USING ( auth.uid() = owner ); 