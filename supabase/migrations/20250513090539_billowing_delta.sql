/*
  # Add Comment Replies and Edit History

  1. Changes
    - Add parent_id to comments table for replies
    - Add is_edited flag to comments
    - Add edited_at timestamp to comments
*/

-- Add new columns to comments table
ALTER TABLE public.comments
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Update RLS policies for comment replies
CREATE POLICY "Users can view comment replies"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Users can reply to comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create function to edit comment
CREATE OR REPLACE FUNCTION public.edit_comment(
  comment_id UUID,
  new_content TEXT,
  user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.comments
  SET 
    content = new_content,
    is_edited = true,
    edited_at = now()
  WHERE id = comment_id 
  AND user_id = user_id;
END;
$$;