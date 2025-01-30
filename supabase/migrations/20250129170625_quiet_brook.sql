/*
  # Add Superadmin Policies and Functions

  1. New Policies
    - Allow superadmins to manage all posts
    - Allow superadmins to manage all profiles
    - Allow superadmins to manage all comments
    - Allow superadmins to manage all likes
    - Allow superadmins to manage all follows
    - Allow superadmins to manage all notifications

  2. Functions
    - Add function to check if user is superadmin
    - Add function to manage user roles
    - Add function to manage content moderation
*/

-- Create function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND is_superadmin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to manage user roles
CREATE OR REPLACE FUNCTION public.manage_user_role(
  target_user_id UUID,
  make_admin BOOLEAN,
  admin_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Check if the admin user is actually a superadmin
  IF NOT public.is_superadmin(admin_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only superadmins can manage roles';
  END IF;

  -- Update the user's role
  UPDATE profiles
  SET is_superadmin = make_admin,
      updated_at = now()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for content moderation
CREATE OR REPLACE FUNCTION public.moderate_content(
  content_type TEXT,
  content_id UUID,
  action TEXT,
  admin_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Check if the user is a superadmin
  IF NOT public.is_superadmin(admin_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only superadmins can moderate content';
  END IF;

  CASE content_type
    WHEN 'post' THEN
      IF action = 'delete' THEN
        DELETE FROM posts WHERE id = content_id;
      END IF;
    WHEN 'comment' THEN
      IF action = 'delete' THEN
        DELETE FROM comments WHERE id = content_id;
      END IF;
    ELSE
      RAISE EXCEPTION 'Invalid content type';
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add superadmin policies for posts
CREATE POLICY "Superadmins can manage all posts"
  ON posts
  USING (
    auth.uid() = user_id OR 
    public.is_superadmin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.is_superadmin(auth.uid())
  );

-- Add superadmin policies for profiles
CREATE POLICY "Superadmins can manage all profiles"
  ON profiles
  USING (
    auth.uid() = id OR 
    public.is_superadmin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = id OR 
    public.is_superadmin(auth.uid())
  );

-- Add superadmin policies for comments
CREATE POLICY "Superadmins can manage all comments"
  ON comments
  USING (
    auth.uid() = user_id OR 
    public.is_superadmin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.is_superadmin(auth.uid())
  );

-- Add superadmin policies for likes
CREATE POLICY "Superadmins can manage all likes"
  ON likes
  USING (
    auth.uid() = user_id OR 
    public.is_superadmin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.is_superadmin(auth.uid())
  );

-- Add superadmin policies for follows
CREATE POLICY "Superadmins can manage all follows"
  ON follows
  USING (
    auth.uid() = follower_id OR 
    public.is_superadmin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = follower_id OR 
    public.is_superadmin(auth.uid())
  );

-- Add superadmin policies for notifications
CREATE POLICY "Superadmins can manage all notifications"
  ON notifications
  USING (
    auth.uid() = user_id OR 
    public.is_superadmin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.is_superadmin(auth.uid())
  );