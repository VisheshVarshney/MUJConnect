/*
  # Fix RLS and Delete Post Function

  1. Changes
    - Fix storage RLS policies
    - Add delete_post function with proper joins
    - Update media_files RLS policies
*/

-- Drop existing storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Media files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;

-- Create new storage policies
CREATE POLICY "Storage items are publicly accessible"
  ON storage.objects FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Update media_files policies
DROP POLICY IF EXISTS "Users can insert media files for own posts" ON public.media_files;
DROP POLICY IF EXISTS "Users can update own media files" ON public.media_files;
DROP POLICY IF EXISTS "Users can delete own media files" ON public.media_files;

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

-- Create improved delete_post function
CREATE OR REPLACE FUNCTION public.delete_post(
  post_id UUID,
  user_id UUID,
  is_superadmin BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is authorized to delete the post
  IF NOT EXISTS (
    SELECT 1 FROM posts p
    WHERE p.id = post_id
    AND (p.user_id = user_id OR is_superadmin = true)
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Delete all related data
  DELETE FROM likes l WHERE l.post_id = $1;
  DELETE FROM comments c WHERE c.post_id = $1;
  DELETE FROM media_files mf WHERE mf.post_id = $1;
  DELETE FROM posts p WHERE p.id = $1;
END;
$$;