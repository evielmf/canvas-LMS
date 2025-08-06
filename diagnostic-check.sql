-- DIAGNOSTIC: Check current RLS policy state
-- Run this first to see what policies currently exist

SELECT 
    tablename, 
    policyname, 
    cmd,
    CASE 
        WHEN policyname LIKE '%manage%' THEN '✅ Optimized'
        ELSE '⚠️ Needs optimization'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'study_reminders', 'weekly_schedule', 'canvas_tokens', 
    'canvas_courses_cache', 'canvas_assignments_cache', 'study_sessions',
    'analytics_snapshots', 'course_health_scores', 'sync_conflicts',
    'ai_conversations', 'ai_usage_stats'
)
ORDER BY tablename, policyname;

-- Count policies per table
SELECT 
    tablename, 
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) = 1 THEN '✅ Optimized'
        WHEN COUNT(*) > 1 THEN '⚠️ Has multiple policies'
        ELSE '❌ No policies'
    END as optimization_status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'study_reminders', 'weekly_schedule', 'canvas_tokens', 
    'canvas_courses_cache', 'canvas_assignments_cache', 'study_sessions',
    'analytics_snapshots', 'course_health_scores', 'sync_conflicts',
    'ai_conversations', 'ai_usage_stats'
)
GROUP BY tablename
ORDER BY tablename;
