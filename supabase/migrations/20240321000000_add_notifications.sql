    -- Create notifications table
    CREATE TABLE IF NOT EXISTS notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        reference_id UUID,
        reference_type TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- Create index for faster queries
    CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);

    -- Enable RLS
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view their own notifications"
        ON notifications FOR SELECT
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can update their own notifications"
        ON notifications FOR UPDATE
        USING (auth.uid() = user_id);

    -- Create function to handle notification creation
    CREATE OR REPLACE FUNCTION create_notification(
        p_user_id UUID,
        p_type TEXT,
        p_content TEXT,
        p_reference_id UUID DEFAULT NULL,
        p_reference_type TEXT DEFAULT NULL
    ) RETURNS UUID AS $$
    DECLARE
        v_notification_id UUID;
    BEGIN
        INSERT INTO notifications (
            user_id,
            type,
            content,
            reference_id,
            reference_type
        ) VALUES (
            p_user_id,
            p_type,
            p_content,
            p_reference_id,
            p_reference_type
        ) RETURNING id INTO v_notification_id;
        
        RETURN v_notification_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER; 