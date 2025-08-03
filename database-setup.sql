-- Canvas LMS Dashboard Database Setup
-- Run this in your Supabase SQL Editor

-- Create tables for Canvas LMS Student Dashboard

-- Table to store encrypted Canvas API tokens
CREATE TABLE IF NOT EXISTS canvas_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    canvas_url TEXT NOT NULL,
    encrypted_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Table to store study reminders
CREATE TABLE IF NOT EXISTS study_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    assignment_id INTEGER, -- Canvas assignment ID if linked
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store weekly schedule entries
CREATE TABLE IF NOT EXISTS weekly_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    course_name TEXT,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to cache Canvas assignments (optional - for offline access)
CREATE TABLE IF NOT EXISTS canvas_assignments_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    canvas_assignment_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    due_at TIMESTAMP WITH TIME ZONE,
    points_possible NUMERIC,
    submission_types TEXT[],
    html_url TEXT,
    description TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    score NUMERIC,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, canvas_assignment_id)
);

-- Table to cache Canvas courses
CREATE TABLE IF NOT EXISTS canvas_courses_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    canvas_course_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    course_code TEXT,
    enrollment_term_id INTEGER,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, canvas_course_id)
);

-- Row Level Security (RLS) policies
ALTER TABLE canvas_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_assignments_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_courses_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own Canvas tokens" ON canvas_tokens;
DROP POLICY IF EXISTS "Users can insert their own Canvas tokens" ON canvas_tokens;
DROP POLICY IF EXISTS "Users can update their own Canvas tokens" ON canvas_tokens;
DROP POLICY IF EXISTS "Users can delete their own Canvas tokens" ON canvas_tokens;

-- Policies for canvas_tokens
CREATE POLICY "Users can view their own Canvas tokens" ON canvas_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Canvas tokens" ON canvas_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Canvas tokens" ON canvas_tokens
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Canvas tokens" ON canvas_tokens
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for other tables
CREATE POLICY "Users can manage their own reminders" ON study_reminders
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own schedule" ON weekly_schedule
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cached assignments" ON canvas_assignments_cache
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cached courses" ON canvas_courses_cache
    FOR ALL USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_canvas_tokens_user_id ON canvas_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_study_reminders_user_id ON study_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_cache_user_id ON canvas_assignments_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_courses_cache_user_id ON canvas_courses_cache(user_id);
