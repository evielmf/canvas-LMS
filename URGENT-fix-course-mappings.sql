-- IMMEDIATE FIX: Create missing course_name_mappings table
-- Run this SQL directly in your Supabase SQL Editor

-- Create the course_name_mappings table
CREATE TABLE IF NOT EXISTS course_name_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  original_name TEXT,
  mapped_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE course_name_mappings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own course mappings" ON course_name_mappings;
CREATE POLICY "Users can view their own course mappings" ON course_name_mappings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own course mappings" ON course_name_mappings;
CREATE POLICY "Users can insert their own course mappings" ON course_name_mappings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own course mappings" ON course_name_mappings;
CREATE POLICY "Users can update their own course mappings" ON course_name_mappings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own course mappings" ON course_name_mappings;
CREATE POLICY "Users can delete their own course mappings" ON course_name_mappings
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_name_mappings_user_id ON course_name_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_course_name_mappings_course_id ON course_name_mappings(user_id, course_id);

-- Verify table was created
SELECT 'course_name_mappings table created successfully!' as status;
