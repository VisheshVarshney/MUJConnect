-- Create error_logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    page_url TEXT NOT NULL,
    browser_info JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    error_type TEXT NOT NULL,
    additional_info JSONB,
    ip_address TEXT
);

-- Add RLS policies
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Only superadmins can view error logs
CREATE POLICY "Only superadmins can view error logs"
    ON public.error_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_superadmin = true
        )
    );

-- Anyone can insert error logs
CREATE POLICY "Anyone can insert error logs"
    ON public.error_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS error_logs_user_id_idx ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS error_logs_error_type_idx ON public.error_logs(error_type); 