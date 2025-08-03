-- Migration to add missing columns to canvas tables

-- Add missing columns to canvas_tokens table
ALTER TABLE canvas_tokens 
ADD COLUMN IF NOT EXISTS token_name TEXT;

-- Add missing columns to canvas_assignments_cache table
ALTER TABLE canvas_assignments_cache 
ADD COLUMN IF NOT EXISTS has_submission BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS workflow_state TEXT,
ADD COLUMN IF NOT EXISTS assignment_group_id INTEGER,
ADD COLUMN IF NOT EXISTS created_at_canvas TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at_canvas TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS score NUMERIC,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to canvas_courses_cache table
ALTER TABLE canvas_courses_cache 
ADD COLUMN IF NOT EXISTS workflow_state TEXT,
ADD COLUMN IF NOT EXISTS start_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS course_color TEXT,
ADD COLUMN IF NOT EXISTS canvas_course_id INTEGER;
