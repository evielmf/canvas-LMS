-- Setup script to ensure all Canvas LMS dashboard tables exist
-- Run this in your Supabase SQL editor if tables don't exist

-- Create tables for Canvas LMS Student Dashboard
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

-- Table to cache Canvas assignments
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
DO $$ 
BEGIN
    -- Enable RLS if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'canvas_tokens' AND relrowsecurity = true
    ) THEN
        ALTER TABLE canvas_tokens ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'study_reminders' AND relrowsecurity = true
    ) THEN
        ALTER TABLE study_reminders ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'canvas_assignments_cache' AND relrowsecurity = true
    ) THEN
        ALTER TABLE canvas_assignments_cache ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'canvas_courses_cache' AND relrowsecurity = true
    ) THEN
        ALTER TABLE canvas_courses_cache ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Policies for canvas_tokens
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own Canvas tokens'
    ) THEN
        CREATE POLICY "Users can view their own Canvas tokens" ON canvas_tokens
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own Canvas tokens'
    ) THEN
        CREATE POLICY "Users can insert their own Canvas tokens" ON canvas_tokens
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own Canvas tokens'
    ) THEN
        CREATE POLICY "Users can update their own Canvas tokens" ON canvas_tokens
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own Canvas tokens'
    ) THEN
        CREATE POLICY "Users can delete their own Canvas tokens" ON canvas_tokens
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Similar policies for other tables...
-- (Add more policies as needed)
