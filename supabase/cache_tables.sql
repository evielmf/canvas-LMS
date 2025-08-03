-- Drop existing cache tables to recreate with correct structure
DROP TABLE IF EXISTS canvas_assignments_cache CASCADE;
DROP TABLE IF EXISTS canvas_courses_cache CASCADE;

-- Table to cache Canvas courses
CREATE TABLE canvas_courses_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT NOT NULL,
    name TEXT NOT NULL,
    course_code TEXT,
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    workflow_state TEXT DEFAULT 'active',
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Table to cache Canvas assignments
CREATE TABLE canvas_assignments_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assignment_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    due_at TIMESTAMP WITH TIME ZONE,
    points_possible NUMERIC DEFAULT 0,
    submission_types TEXT[],
    html_url TEXT,
    course_name TEXT,
    course_code TEXT,
    has_submission BOOLEAN DEFAULT FALSE,
    submission_score NUMERIC,
    submission_submitted_at TIMESTAMP WITH TIME ZONE,
    submission_workflow_state TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, assignment_id)
);

-- Add last_sync column to canvas_tokens
ALTER TABLE canvas_tokens ADD COLUMN IF NOT EXISTS last_sync TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE canvas_courses_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_assignments_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for canvas_courses_cache
CREATE POLICY "Users can view their own Canvas courses cache" ON canvas_courses_cache
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Canvas courses cache" ON canvas_courses_cache
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Canvas courses cache" ON canvas_courses_cache
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Canvas courses cache" ON canvas_courses_cache
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for canvas_assignments_cache
CREATE POLICY "Users can view their own Canvas assignments cache" ON canvas_assignments_cache
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Canvas assignments cache" ON canvas_assignments_cache
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Canvas assignments cache" ON canvas_assignments_cache
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Canvas assignments cache" ON canvas_assignments_cache
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_canvas_courses_cache_user_id ON canvas_courses_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_cache_user_id ON canvas_assignments_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_cache_due_at ON canvas_assignments_cache(due_at);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_cache_course_id ON canvas_assignments_cache(course_id);
