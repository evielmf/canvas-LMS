-- Create tables for Canvas LMS Student Dashboard

-- Table to store encrypted Canvas API tokens
CREATE TABLE canvas_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    canvas_url TEXT NOT NULL,
    encrypted_token TEXT NOT NULL,
    token_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Table to store study reminders
CREATE TABLE study_reminders (
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
CREATE TABLE weekly_schedule (
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
CREATE TABLE canvas_assignments_cache (
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
    has_submission BOOLEAN DEFAULT FALSE,
    workflow_state TEXT,
    assignment_group_id INTEGER,
    created_at_canvas TIMESTAMP WITH TIME ZONE,
    updated_at_canvas TIMESTAMP WITH TIME ZONE,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, canvas_assignment_id)
);

-- Table to cache Canvas courses
CREATE TABLE canvas_courses_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    canvas_course_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    course_code TEXT,
    enrollment_term_id INTEGER,
    workflow_state TEXT,
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    course_color TEXT,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, canvas_course_id)
);

-- Row Level Security (RLS) policies
ALTER TABLE canvas_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_assignments_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_courses_cache ENABLE ROW LEVEL SECURITY;

-- Policies for canvas_tokens
CREATE POLICY "Users can view their own Canvas tokens" ON canvas_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Canvas tokens" ON canvas_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Canvas tokens" ON canvas_tokens
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Canvas tokens" ON canvas_tokens
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for study_reminders
CREATE POLICY "Users can view their own study reminders" ON study_reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study reminders" ON study_reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study reminders" ON study_reminders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study reminders" ON study_reminders
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for weekly_schedule
CREATE POLICY "Users can view their own weekly schedule" ON weekly_schedule
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly schedule" ON weekly_schedule
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly schedule" ON weekly_schedule
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly schedule" ON weekly_schedule
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for canvas_assignments_cache
CREATE POLICY "Users can view their own cached assignments" ON canvas_assignments_cache
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cached assignments" ON canvas_assignments_cache
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cached assignments" ON canvas_assignments_cache
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cached assignments" ON canvas_assignments_cache
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for canvas_courses_cache
CREATE POLICY "Users can view their own cached courses" ON canvas_courses_cache
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cached courses" ON canvas_courses_cache
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cached courses" ON canvas_courses_cache
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cached courses" ON canvas_courses_cache
    FOR DELETE USING (auth.uid() = user_id);

-- Functions to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_canvas_tokens_updated_at BEFORE UPDATE ON canvas_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_reminders_updated_at BEFORE UPDATE ON study_reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_schedule_updated_at BEFORE UPDATE ON weekly_schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX idx_canvas_tokens_user_id ON canvas_tokens(user_id);
CREATE INDEX idx_study_reminders_user_id ON study_reminders(user_id);
CREATE INDEX idx_study_reminders_reminder_time ON study_reminders(reminder_time);
CREATE INDEX idx_weekly_schedule_user_id ON weekly_schedule(user_id);
CREATE INDEX idx_weekly_schedule_day_time ON weekly_schedule(day_of_week, start_time);
CREATE INDEX idx_canvas_assignments_cache_user_id ON canvas_assignments_cache(user_id);
CREATE INDEX idx_canvas_assignments_cache_due_at ON canvas_assignments_cache(due_at);
CREATE INDEX idx_canvas_courses_cache_user_id ON canvas_courses_cache(user_id);
