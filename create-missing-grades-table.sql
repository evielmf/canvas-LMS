-- Create missing canvas_grades_cache table with optimized RLS
-- This table was referenced in your app but didn't exist in the database

-- Create the canvas_grades_cache table
CREATE TABLE IF NOT EXISTS public.canvas_grades_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assignment_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    submission_id TEXT,
    score DECIMAL,
    grade TEXT,
    submitted_at TIMESTAMPTZ,
    graded_at TIMESTAMPTZ,
    late BOOLEAN DEFAULT FALSE,
    missing BOOLEAN DEFAULT FALSE,
    excused BOOLEAN DEFAULT FALSE,
    workflow_state TEXT,
    submission_type TEXT,
    attempt INTEGER,
    cached_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    canvas_updated_at TIMESTAMPTZ,
    
    -- Create composite indexes for common queries
    UNIQUE(user_id, assignment_id, course_id)
);

-- Enable RLS on the new table
ALTER TABLE public.canvas_grades_cache ENABLE ROW LEVEL SECURITY;

-- Create optimized RLS policy (using the same pattern as other optimized tables)
CREATE POLICY "Users can manage their own Canvas grades cache" ON public.canvas_grades_cache
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_canvas_grades_cache_user_id ON public.canvas_grades_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_grades_cache_course_id ON public.canvas_grades_cache(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_canvas_grades_cache_cached_at ON public.canvas_grades_cache(cached_at);
CREATE INDEX IF NOT EXISTS idx_canvas_grades_cache_assignment ON public.canvas_grades_cache(user_id, assignment_id);

-- Add helpful comments
COMMENT ON TABLE public.canvas_grades_cache IS 'Cached Canvas grades data for improved performance';
COMMENT ON COLUMN public.canvas_grades_cache.cached_at IS 'When this grade data was last cached';
COMMENT ON COLUMN public.canvas_grades_cache.canvas_updated_at IS 'When Canvas last updated this grade';

-- Verify the table was created with RLS enabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    'Table created successfully' as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'canvas_grades_cache';

-- Verify the RLS policy was created
SELECT 
    tablename, 
    policyname, 
    cmd,
    'Policy created successfully' as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'canvas_grades_cache';
