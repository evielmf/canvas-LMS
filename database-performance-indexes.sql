-- Performance optimization indexes for Canvas LMS cache tables
-- Run these in your Supabase SQL editor for faster query performance

-- Optimize canvas_assignments_cache table
CREATE INDEX IF NOT EXISTS idx_assignments_user_due 
ON canvas_assignments_cache (user_id, due_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_assignments_course 
ON canvas_assignments_cache (user_id, course_id);

-- Optimize canvas_courses_cache table  
CREATE INDEX IF NOT EXISTS idx_courses_user 
ON canvas_courses_cache (user_id);

-- Optimize canvas_grades_cache table
CREATE INDEX IF NOT EXISTS idx_grades_user_graded 
ON canvas_grades_cache (user_id, graded_at DESC);

CREATE INDEX IF NOT EXISTS idx_grades_assignment 
ON canvas_grades_cache (user_id, assignment_id);

-- Create composite index for parallel fetch optimization
CREATE INDEX IF NOT EXISTS idx_assignments_parallel_fetch 
ON canvas_assignments_cache (user_id, assignment_id, course_id, due_at);

-- Add partial indexes for active data only
CREATE INDEX IF NOT EXISTS idx_assignments_active 
ON canvas_assignments_cache (user_id, due_at) 
WHERE due_at > NOW() - INTERVAL '6 months';

-- Analyze tables for better query planning
ANALYZE canvas_assignments_cache;
ANALYZE canvas_courses_cache;  
ANALYZE canvas_grades_cache;

-- Optional: Create materialized view for dashboard summary (if you want even faster performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_summary AS
SELECT 
    a.user_id,
    COUNT(a.assignment_id) as total_assignments,
    COUNT(CASE WHEN a.due_at > NOW() THEN 1 END) as upcoming_assignments,
    COUNT(CASE WHEN a.due_at < NOW() AND a.submission_submitted_at IS NULL THEN 1 END) as overdue_assignments,
    COUNT(g.submission_id) as total_grades,
    AVG(g.score) as avg_score,
    MAX(a.updated_at) as last_assignment_update,
    MAX(g.updated_at) as last_grade_update
FROM canvas_assignments_cache a
LEFT JOIN canvas_grades_cache g ON a.user_id = g.user_id AND a.assignment_id = g.assignment_id
GROUP BY a.user_id;

-- Refresh the materialized view (run this periodically or set up automatic refresh)
-- REFRESH MATERIALIZED VIEW dashboard_summary;
