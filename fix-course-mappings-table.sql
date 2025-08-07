-- Fix for missing course_name_mappings table
-- This table stores custom course name mappings for user customization

-- Create the course_name_mappings table
CREATE TABLE IF NOT EXISTS public.course_name_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  canvas_course_id TEXT NOT NULL,
  original_name TEXT NOT NULL,
  custom_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one mapping per user per course
  UNIQUE(user_id, canvas_course_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_mappings_user_id ON course_name_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_course_mappings_canvas_id ON course_name_mappings(canvas_course_id);
CREATE INDEX IF NOT EXISTS idx_course_mappings_user_course ON course_name_mappings(user_id, canvas_course_id);

-- Enable Row Level Security
ALTER TABLE course_name_mappings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - users can only access their own mappings
CREATE POLICY "Users can manage their own course mappings" ON course_name_mappings
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_course_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_mappings_updated_at
  BEFORE UPDATE ON course_name_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_course_mappings_updated_at();

-- Insert some example data (optional)
-- This shows how the table should be used
INSERT INTO course_name_mappings (user_id, canvas_course_id, original_name, custom_name)
VALUES 
  -- Replace with actual user_id and course data
  ('example-user-id', '12345', 'CS 101: Introduction to Computer Science Fall 2024', 'Intro to CS'),
  ('example-user-id', '12346', 'MATH 201: Calculus II Spring 2024', 'Calc 2')
ON CONFLICT (user_id, canvas_course_id) DO NOTHING;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON course_name_mappings TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
