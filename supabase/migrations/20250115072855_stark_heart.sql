-- Enable storage for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Add storage policy for authenticated users
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar"
  ON storage.objects FOR INSERT 
  WITH CHECK ( bucket_id = 'avatars' );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING ( auth.uid() = owner );