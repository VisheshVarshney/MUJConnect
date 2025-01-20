/*
  # Media Storage Configuration

  1. New Tables
    - `media_files`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `file_path` (text)
      - `file_type` (text)
      - `width` (integer)
      - `height` (integer)
      - `created_at` (timestamp)

  2. Storage
    - New bucket for post media
    - Storage policies for authenticated users

  3. Security
    - Enable RLS on media_files table
    - Add policies for media access and management
*/

-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create media files table
CREATE TABLE IF NOT EXISTS public.media_files (
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

-- Media files policies
CREATE POLICY "Media files are viewable by everyone"
  ON public.media_files FOR SELECT
  USING (true);

CREATE POLICY "Users can insert media files for own posts"
  ON public.media_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own media files"
  ON public.media_files FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own media files"
  ON public.media_files FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );