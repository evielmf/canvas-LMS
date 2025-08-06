-- Smart Sync Conflict Resolver Table
-- Tracks inconsistencies between cached Supabase data and live Canvas API data

CREATE TABLE sync_conflicts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('assignment', 'course', 'grade')),
    item_id TEXT NOT NULL, -- Canvas item ID (assignment_id, course_id, etc.)
    field TEXT NOT NULL, -- Which field has the conflict (name, due_date, points_possible, etc.)
    cached_value JSONB, -- Value currently stored in our cache
    live_value JSONB, -- Value from Canvas API
    status TEXT DEFAULT 'unresolved' CHECK (status IN ('unresolved', 'resolved', 'ignored')),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by TEXT, -- How it was resolved: 'user', 'auto', 'system'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sync_conflicts
CREATE POLICY "Users can view their own sync conflicts" ON sync_conflicts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync conflicts" ON sync_conflicts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync conflicts" ON sync_conflicts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sync conflicts" ON sync_conflicts
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_sync_conflicts_user_id ON sync_conflicts(user_id);
CREATE INDEX idx_sync_conflicts_status ON sync_conflicts(status);
CREATE INDEX idx_sync_conflicts_item_type ON sync_conflicts(item_type);
CREATE INDEX idx_sync_conflicts_detected_at ON sync_conflicts(detected_at);

-- Unique constraint to prevent duplicate conflicts
CREATE UNIQUE INDEX idx_sync_conflicts_unique ON sync_conflicts(user_id, item_type, item_id, field) 
WHERE status = 'unresolved';

-- Add update trigger
CREATE OR REPLACE FUNCTION update_sync_conflicts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sync_conflicts_updated_at
    BEFORE UPDATE ON sync_conflicts
    FOR EACH ROW
    EXECUTE FUNCTION update_sync_conflicts_updated_at();
