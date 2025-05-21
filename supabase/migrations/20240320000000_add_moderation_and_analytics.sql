-- Create content moderation tables
CREATE TABLE flagged_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type TEXT NOT NULL, -- 'post', 'comment', 'user'
    content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    reported_by UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id)
);

CREATE TABLE content_filters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filter_type TEXT NOT NULL,
    pattern TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('flag', 'block', 'warn')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create enhanced analytics tables
CREATE TABLE user_engagement (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT NOT NULL,
    page_views INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in seconds
    last_active TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE traffic_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source TEXT NOT NULL,
    medium TEXT,
    campaign TEXT,
    visits INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create system health monitoring tables
CREATE TABLE system_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    metric_type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE error_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    error_type TEXT NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better query performance
CREATE INDEX idx_flagged_content_status ON flagged_content(status);
CREATE INDEX idx_flagged_content_content_type ON flagged_content(content_type);
CREATE INDEX idx_user_engagement_user_id ON user_engagement(user_id);
CREATE INDEX idx_traffic_sources_date ON traffic_sources(date);
CREATE INDEX idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at);

-- Add RLS policies
ALTER TABLE flagged_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for superadmins
CREATE POLICY "Superadmins can manage flagged content" ON flagged_content
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_superadmin = true));

CREATE POLICY "Superadmins can manage content filters" ON content_filters
    FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_superadmin = true));

CREATE POLICY "Superadmins can view user engagement" ON user_engagement
    FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE is_superadmin = true));

CREATE POLICY "Superadmins can view traffic sources" ON traffic_sources
    FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE is_superadmin = true));

CREATE POLICY "Superadmins can view system metrics" ON system_metrics
    FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE is_superadmin = true));

CREATE POLICY "Superadmins can view error logs" ON error_logs
    FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE is_superadmin = true)); 