-- Create enum type for content filter categories
CREATE TYPE content_filter_category AS ENUM (
  'PROFANITY',
  'SELF_ADVERTISEMENT',
  'HATE_SPEECH',
  'HARASSMENT',
  'ACCEPTABLE'
);

-- Create content filter logs table
CREATE TABLE IF NOT EXISTS content_filter_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_acceptable BOOLEAN NOT NULL,
  reason TEXT,
  category content_filter_category NOT NULL,

  -- Add indexes for common queries
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_content_filter_logs_user_id ON content_filter_logs(user_id);
CREATE INDEX idx_content_filter_logs_created_at ON content_filter_logs(created_at);
CREATE INDEX idx_content_filter_logs_is_acceptable ON content_filter_logs(is_acceptable);
CREATE INDEX idx_content_filter_logs_category ON content_filter_logs(category);

-- Add comment to the table
COMMENT ON TABLE content_filter_logs IS 'Logs of content moderation results from AI filtering'; 