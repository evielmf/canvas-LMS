-- Comprehensive database schema fix for Canvas integration
-- Run this in Supabase SQL Editor

-- Step 1: Check if columns exist and add them if needed

-- Fix canvas_courses_cache table
DO $$
BEGIN
    -- First, clear any existing data to avoid migration issues
    TRUNCATE canvas_courses_cache;
    
    -- Check if canvas_course_id exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_courses_cache' AND column_name='canvas_course_id') THEN
        ALTER TABLE canvas_courses_cache ADD COLUMN canvas_course_id INTEGER;
    END IF;
    
    -- Drop course_id column if it exists (since we're using canvas_course_id now)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_courses_cache' AND column_name='course_id') THEN
        ALTER TABLE canvas_courses_cache DROP COLUMN course_id;
    END IF;
    
    -- Add other missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_courses_cache' AND column_name='workflow_state') THEN
        ALTER TABLE canvas_courses_cache ADD COLUMN workflow_state TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_courses_cache' AND column_name='start_at') THEN
        ALTER TABLE canvas_courses_cache ADD COLUMN start_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_courses_cache' AND column_name='end_at') THEN
        ALTER TABLE canvas_courses_cache ADD COLUMN end_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_courses_cache' AND column_name='course_color') THEN
        ALTER TABLE canvas_courses_cache ADD COLUMN course_color TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_courses_cache' AND column_name='enrollment_term_id') THEN
        ALTER TABLE canvas_courses_cache ADD COLUMN enrollment_term_id INTEGER;
    END IF;
END $$;

-- Step 2: Fix canvas_assignments_cache table
DO $$
BEGIN
    -- First, clear any existing data to avoid migration issues
    TRUNCATE canvas_assignments_cache;
    
    -- Check if canvas_assignment_id exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_assignments_cache' AND column_name='canvas_assignment_id') THEN
        ALTER TABLE canvas_assignments_cache ADD COLUMN canvas_assignment_id INTEGER;
    END IF;
    
    -- Drop assignment_id column if it exists (since we're using canvas_assignment_id now)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_assignments_cache' AND column_name='assignment_id') THEN
        ALTER TABLE canvas_assignments_cache DROP COLUMN assignment_id;
    END IF;
    
    -- Ensure course_id column exists (this should stay as course_id)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_assignments_cache' AND column_name='course_id') THEN
        ALTER TABLE canvas_assignments_cache ADD COLUMN course_id INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    -- Add other missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_assignments_cache' AND column_name='has_submission') THEN
        ALTER TABLE canvas_assignments_cache ADD COLUMN has_submission BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_assignments_cache' AND column_name='workflow_state') THEN
        ALTER TABLE canvas_assignments_cache ADD COLUMN workflow_state TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_assignments_cache' AND column_name='assignment_group_id') THEN
        ALTER TABLE canvas_assignments_cache ADD COLUMN assignment_group_id INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_assignments_cache' AND column_name='created_at_canvas') THEN
        ALTER TABLE canvas_assignments_cache ADD COLUMN created_at_canvas TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_assignments_cache' AND column_name='updated_at_canvas') THEN
        ALTER TABLE canvas_assignments_cache ADD COLUMN updated_at_canvas TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_assignments_cache' AND column_name='score') THEN
        ALTER TABLE canvas_assignments_cache ADD COLUMN score NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_assignments_cache' AND column_name='submitted_at') THEN
        ALTER TABLE canvas_assignments_cache ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_assignments_cache' AND column_name='synced_at') THEN
        ALTER TABLE canvas_assignments_cache ADD COLUMN synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Step 3: Update constraints to match new structure
DO $$
BEGIN
    -- Make canvas_course_id NOT NULL for courses table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_courses_cache' AND column_name='canvas_course_id' AND is_nullable='YES') THEN
        -- First ensure no null values
        DELETE FROM canvas_courses_cache WHERE canvas_course_id IS NULL;
        -- Then add NOT NULL constraint
        ALTER TABLE canvas_courses_cache ALTER COLUMN canvas_course_id SET NOT NULL;
    END IF;
    
    -- Make canvas_assignment_id NOT NULL for assignments table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_assignments_cache' AND column_name='canvas_assignment_id' AND is_nullable='YES') THEN
        -- First ensure no null values
        DELETE FROM canvas_assignments_cache WHERE canvas_assignment_id IS NULL;
        -- Then add NOT NULL constraint
        ALTER TABLE canvas_assignments_cache ALTER COLUMN canvas_assignment_id SET NOT NULL;
    END IF;
    
    -- Update unique constraints
    BEGIN
        ALTER TABLE canvas_courses_cache DROP CONSTRAINT IF EXISTS canvas_courses_cache_user_id_canvas_course_id_key;
        ALTER TABLE canvas_courses_cache ADD CONSTRAINT canvas_courses_cache_user_id_canvas_course_id_key UNIQUE(user_id, canvas_course_id);
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore if constraint doesn't exist
    END;
    
    BEGIN
        ALTER TABLE canvas_assignments_cache DROP CONSTRAINT IF EXISTS canvas_assignments_cache_user_id_canvas_assignment_id_key;
        ALTER TABLE canvas_assignments_cache ADD CONSTRAINT canvas_assignments_cache_user_id_canvas_assignment_id_key UNIQUE(user_id, canvas_assignment_id);
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore if constraint doesn't exist
    END;
END $$;

-- Step 4: Add missing columns to canvas_tokens table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_tokens' AND column_name='token_name') THEN
        ALTER TABLE canvas_tokens ADD COLUMN token_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_tokens' AND column_name='last_sync') THEN
        ALTER TABLE canvas_tokens ADD COLUMN last_sync TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Clear any existing data to start fresh after schema changes (already done above)
-- TRUNCATE canvas_courses_cache, canvas_assignments_cache;

-- Success message
SELECT 'Database schema updated successfully!' as result;
