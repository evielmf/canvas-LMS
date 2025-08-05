-- Analytics Database Tables
-- These tables are completely isolated and do not affect existing functionality

-- Tracks study session logs for time allocation analytics
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT, -- References course_id from canvas_courses_cache
  course_name TEXT,
  duration_minutes INT DEFAULT 0,
  activity_type TEXT DEFAULT 'study', -- 'study', 'assignment', 'review'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores weekly analytics summaries for performance tracking
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start_date DATE NOT NULL,
  assignments_completed INT DEFAULT 0,
  assignments_due INT DEFAULT 0,
  study_minutes INT DEFAULT 0,
  avg_grade NUMERIC DEFAULT 0,
  total_courses INT DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- Stores course health metrics for dashboard insights
CREATE TABLE IF NOT EXISTS course_health_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  course_name TEXT NOT NULL,
  health_score NUMERIC DEFAULT 0, -- 0-100 score
  grade_average NUMERIC DEFAULT 0,
  completion_rate NUMERIC DEFAULT 0,
  engagement_level NUMERIC DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS on new tables
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_health_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_sessions
CREATE POLICY "Users can view their own study sessions" ON study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions" ON study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" ON study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions" ON study_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for analytics_snapshots
CREATE POLICY "Users can view their own analytics snapshots" ON analytics_snapshots
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics snapshots" ON analytics_snapshots
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics snapshots" ON analytics_snapshots
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics snapshots" ON analytics_snapshots
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for course_health_scores
CREATE POLICY "Users can view their own course health scores" ON course_health_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course health scores" ON course_health_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own course health scores" ON course_health_scores
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own course health scores" ON course_health_scores
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON study_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_user_week ON analytics_snapshots(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_course_health_user_course ON course_health_scores(user_id, course_id);
