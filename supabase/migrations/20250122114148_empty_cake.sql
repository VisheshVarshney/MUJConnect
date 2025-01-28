/*
  # Fix Media Files Table

  1. Changes
    - Drop existing table and policies if they exist
    - Recreate media_files table with proper constraints
    - Reapply all policies
    
  2. Security
    - Ensure RLS is enabled
    - Reapply all security policies
*/

-- Drop existing objects if they exist
DROP TABLE IF EXISTS public.media_files CASCADE;
DROP POLICY IF EXISTS "Media files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;

-- Create media files table
CREATE TABLE public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_file_type CHECK (file_type IN ('image', 'video'))
);

-- Enable RLS
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Media files policies
CREATE POLICY "Media files are viewable by everyone"
  ON public.media_files FOR SELECT
  USING (true);

CREATE POLICY "Users can insert media files"
  ON public.media_files FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own media files"
  ON public.media_files FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_id 
      AND (p.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles pr
        WHERE pr.id = auth.uid() AND pr.is_superadmin = true
      ))
    )
  );

CREATE POLICY "Users can delete own media files"
  ON public.media_files FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_id 
      AND (p.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles pr
        WHERE pr.id = auth.uid() AND pr.is_superadmin = true
      ))
    )
  );

-- Ensure storage bucket exists
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('post-media', 'post-media', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Storage policies
CREATE POLICY "Media files are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media');

CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-media' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'post-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );