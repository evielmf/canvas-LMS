-- Supabase RLS Performance Optimization - SAFE VERSION
-- Handles existing optimized policies and applies missing fixes
-- Generated based on database linter report

-- ========================================
-- 1. SAFE POLICY REPLACEMENT APPROACH
-- ========================================

-- STUDY_REMINDERS - Safe policy replacement
DROP POLICY IF EXISTS "Users can view their own study reminders" ON public.study_reminders;
DROP POLICY IF EXISTS "Users can insert their own study reminders" ON public.study_reminders;
DROP POLICY IF EXISTS "Users can update their own study reminders" ON public.study_reminders;
DROP POLICY IF EXISTS "Users can delete their own study reminders" ON public.study_reminders;
DROP POLICY IF EXISTS "Users can manage their own reminders" ON public.study_reminders;

CREATE POLICY "Users can manage their own reminders" ON public.study_reminders
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- WEEKLY_SCHEDULE - Safe policy replacement
DROP POLICY IF EXISTS "Users can view their own weekly schedule" ON public.weekly_schedule;
DROP POLICY IF EXISTS "Users can insert their own weekly schedule" ON public.weekly_schedule;
DROP POLICY IF EXISTS "Users can update their own weekly schedule" ON public.weekly_schedule;
DROP POLICY IF EXISTS "Users can delete their own weekly schedule" ON public.weekly_schedule;
DROP POLICY IF EXISTS "Users can manage their own schedule" ON public.weekly_schedule;

CREATE POLICY "Users can manage their own schedule" ON public.weekly_schedule
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- CANVAS_TOKENS - Safe policy replacement
DROP POLICY IF EXISTS "Users can view their own Canvas tokens" ON public.canvas_tokens;
DROP POLICY IF EXISTS "Users can insert their own Canvas tokens" ON public.canvas_tokens;
DROP POLICY IF EXISTS "Users can update their own Canvas tokens" ON public.canvas_tokens;
DROP POLICY IF EXISTS "Users can delete their own Canvas tokens" ON public.canvas_tokens;
DROP POLICY IF EXISTS "Users can manage their own Canvas tokens" ON public.canvas_tokens;

CREATE POLICY "Users can manage their own Canvas tokens" ON public.canvas_tokens
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- CANVAS_COURSES_CACHE - Safe policy replacement
DROP POLICY IF EXISTS "Users can view their own Canvas courses cache" ON public.canvas_courses_cache;
DROP POLICY IF EXISTS "Users can insert their own Canvas courses cache" ON public.canvas_courses_cache;
DROP POLICY IF EXISTS "Users can update their own Canvas courses cache" ON public.canvas_courses_cache;
DROP POLICY IF EXISTS "Users can delete their own Canvas courses cache" ON public.canvas_courses_cache;
DROP POLICY IF EXISTS "Users can manage their own Canvas courses cache" ON public.canvas_courses_cache;

CREATE POLICY "Users can manage their own Canvas courses cache" ON public.canvas_courses_cache
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- CANVAS_ASSIGNMENTS_CACHE - Safe policy replacement
DROP POLICY IF EXISTS "Users can view their own Canvas assignments cache" ON public.canvas_assignments_cache;
DROP POLICY IF EXISTS "Users can insert their own Canvas assignments cache" ON public.canvas_assignments_cache;
DROP POLICY IF EXISTS "Users can update their own Canvas assignments cache" ON public.canvas_assignments_cache;
DROP POLICY IF EXISTS "Users can delete their own Canvas assignments cache" ON public.canvas_assignments_cache;
DROP POLICY IF EXISTS "Users can manage their own Canvas assignments cache" ON public.canvas_assignments_cache;

CREATE POLICY "Users can manage their own Canvas assignments cache" ON public.canvas_assignments_cache
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- STUDY_SESSIONS - Safe policy replacement
DROP POLICY IF EXISTS "Users can view their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can insert their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can update their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can delete their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can manage their own study sessions" ON public.study_sessions;

CREATE POLICY "Users can manage their own study sessions" ON public.study_sessions
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ANALYTICS_SNAPSHOTS - Safe policy replacement
DROP POLICY IF EXISTS "Users can view their own analytics snapshots" ON public.analytics_snapshots;
DROP POLICY IF EXISTS "Users can insert their own analytics snapshots" ON public.analytics_snapshots;
DROP POLICY IF EXISTS "Users can update their own analytics snapshots" ON public.analytics_snapshots;
DROP POLICY IF EXISTS "Users can delete their own analytics snapshots" ON public.analytics_snapshots;
DROP POLICY IF EXISTS "Users can manage their own analytics snapshots" ON public.analytics_snapshots;

CREATE POLICY "Users can manage their own analytics snapshots" ON public.analytics_snapshots
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- COURSE_HEALTH_SCORES - Safe policy replacement
DROP POLICY IF EXISTS "Users can view their own course health scores" ON public.course_health_scores;
DROP POLICY IF EXISTS "Users can insert their own course health scores" ON public.course_health_scores;
DROP POLICY IF EXISTS "Users can update their own course health scores" ON public.course_health_scores;
DROP POLICY IF EXISTS "Users can delete their own course health scores" ON public.course_health_scores;
DROP POLICY IF EXISTS "Users can manage their own course health scores" ON public.course_health_scores;

CREATE POLICY "Users can manage their own course health scores" ON public.course_health_scores
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- SYNC_CONFLICTS - Safe policy replacement
DROP POLICY IF EXISTS "Users can view their own sync conflicts" ON public.sync_conflicts;
DROP POLICY IF EXISTS "Users can insert their own sync conflicts" ON public.sync_conflicts;
DROP POLICY IF EXISTS "Users can update their own sync conflicts" ON public.sync_conflicts;
DROP POLICY IF EXISTS "Users can delete their own sync conflicts" ON public.sync_conflicts;
DROP POLICY IF EXISTS "Users can manage their own sync conflicts" ON public.sync_conflicts;

CREATE POLICY "Users can manage their own sync conflicts" ON public.sync_conflicts
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- AI_CONVERSATIONS - Safe policy replacement
DROP POLICY IF EXISTS "Users can view own AI conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can insert own AI conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can manage own AI conversations" ON public.ai_conversations;

CREATE POLICY "Users can manage own AI conversations" ON public.ai_conversations
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- AI_USAGE_STATS - Safe policy replacement
DROP POLICY IF EXISTS "Users can view own AI usage stats" ON public.ai_usage_stats;
DROP POLICY IF EXISTS "Users can insert own AI usage stats" ON public.ai_usage_stats;
DROP POLICY IF EXISTS "Users can update own AI usage stats" ON public.ai_usage_stats;
DROP POLICY IF EXISTS "Users can manage own AI usage stats" ON public.ai_usage_stats;

CREATE POLICY "Users can manage own AI usage stats" ON public.ai_usage_stats
    FOR ALL
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check that RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'study_reminders', 'weekly_schedule', 'canvas_tokens', 
    'canvas_courses_cache', 'canvas_assignments_cache', 'study_sessions',
    'analytics_snapshots', 'course_health_scores', 'sync_conflicts',
    'ai_conversations', 'ai_usage_stats'
);

-- List all policies to verify cleanup
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'study_reminders', 'weekly_schedule', 'canvas_tokens', 
    'canvas_courses_cache', 'canvas_assignments_cache', 'study_sessions',
    'analytics_snapshots', 'course_health_scores', 'sync_conflicts',
    'ai_conversations', 'ai_usage_stats'
)
ORDER BY tablename, policyname;

-- Count policies per table (should be 1 each)
SELECT tablename, COUNT(*) as policy_count
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
