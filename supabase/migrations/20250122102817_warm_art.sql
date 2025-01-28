/*
  # Fix Delete Post Function
  
  1. Changes
    - Simplify delete_post function to work for both users and superadmins
    - Remove ambiguous column references
*/

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
DECLARE
  post_owner_id UUID;
BEGIN
  -- Get the post owner's ID
  SELECT user_id INTO post_owner_id
  FROM posts
  WHERE id = $1;

  -- Check if user is authorized to delete the post
  IF post_owner_id IS NULL OR (post_owner_id != $2 AND NOT $3) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Delete the post and all related data will be cascade deleted
  DELETE FROM posts WHERE id = $1;
END;
$$;