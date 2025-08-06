-- Course Name Mappings Table
-- This table allows users to manually assign custom names to courses that appear as "Unknown Course"

CREATE TABLE IF NOT EXISTS course_name_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL, -- Canvas course ID or assignment course_id
  original_name TEXT, -- The original course name from Canvas (if any)
  mapped_name TEXT NOT NULL, -- User's custom name for this course
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS for course_name_mappings
ALTER TABLE course_name_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_name_mappings
CREATE POLICY "Users can view their own course mappings" ON course_name_mappings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course mappings" ON course_name_mappings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own course mappings" ON course_name_mappings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own course mappings" ON course_name_mappings
    FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_name_mappings_user_id ON course_name_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_course_name_mappings_course_id ON course_name_mappings(user_id, course_id);
