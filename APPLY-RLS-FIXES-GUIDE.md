# 🚀 RLS Performance Fixes - Step-by-Step Application Guide

## 📋 Pre-Application Checklist

### ✅ **Step 1: Environment Setup Check**
1. **Verify your environment variables**:
   ```bash
   # Check if you have .env.local file
   ls -la .env*
   ```
   
2. **Required environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` 
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for database modifications)

3. **Install required tools** (if not already installed):
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Verify installation
   supabase --version
   ```

### ✅ **Step 2: Backup Current State**
```bash
# 1. Export current RLS policies (IMPORTANT BACKUP!)
supabase db dump --data-only --schema public > backup-before-rls-fix.sql

# 2. Export just the policies for safety
psql "your-database-url" -c "\
SELECT 'DROP POLICY IF EXISTS \"' || policyname || '\" ON ' || schemaname || '.' || tablename || ';' 
FROM pg_policies 
WHERE schemaname = 'public';" > rollback-policies.sql
```

## 🎯 **Application Methods**

### **Method 1: Automated Application (Recommended)**

1. **Dry run first (SAFE)**:
   ```powershell
   .\apply-rls-fixes.ps1 -SupabaseUrl "your-url" -SupabaseAnonKey "your-service-key" -DryRun
   ```

2. **Apply the fixes**:
   ```powershell
   .\apply-rls-fixes.ps1 -SupabaseUrl "your-url" -SupabaseAnonKey "your-service-key"
   ```

### **Method 2: Manual Application (More Control)**

1. **Connect to your database**:
   ```bash
   # Option A: Using Supabase CLI
   supabase db push --db-url "your-database-url" < supabase-rls-performance-fix.sql
   
   # Option B: Using psql directly
   psql "your-database-connection-string" < supabase-rls-performance-fix.sql
   ```

### **Method 3: Step-by-Step Manual (Safest)**

1. **Apply one table at a time**:
   ```sql
   -- Start with a less critical table for testing
   -- STUDY_REMINDERS example:
   
   -- Step 1: Drop old policies
   DROP POLICY IF EXISTS "Users can view their own study reminders" ON public.study_reminders;
   DROP POLICY IF EXISTS "Users can insert their own study reminders" ON public.study_reminders;
   DROP POLICY IF EXISTS "Users can update their own study reminders" ON public.study_reminders;
   DROP POLICY IF EXISTS "Users can delete their own study reminders" ON public.study_reminders;
   
   -- Step 2: Create optimized policy
   CREATE POLICY "Users can manage their own reminders" ON public.study_reminders
       FOR ALL
       USING ((select auth.uid()) = user_id)
       WITH CHECK ((select auth.uid()) = user_id);
   
   -- Step 3: Test immediately
   SELECT COUNT(*) FROM study_reminders; -- Should work if you have data
   ```

## 🧪 **Testing After Each Application**

### **Immediate Tests**
```sql
-- 1. Verify policies are created
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'study_reminders';

-- 2. Test data access (should return your data)
SELECT COUNT(*) FROM study_reminders;

-- 3. Test insert (should work)
INSERT INTO study_reminders (user_id, title, reminder_date) 
VALUES ((select auth.uid()), 'Test Reminder', NOW() + INTERVAL '1 day');
```

### **Application-Level Tests**
```bash
# Test your Next.js app
npm run dev

# Check that:
# 1. Users can see their own data
# 2. Users cannot see other users' data
# 3. CRUD operations work normally
```

## 🚨 **If Something Goes Wrong - Emergency Rollback**

### **Option 1: Restore from Backup**
```bash
# Restore the full backup
psql "your-database-url" < backup-before-rls-fix.sql
```

### **Option 2: Quick Policy Rollback** 
```sql
-- Example: Restore old policies for study_reminders
DROP POLICY "Users can manage their own reminders" ON study_reminders;

CREATE POLICY "Users can view their own study reminders" ON study_reminders
    FOR SELECT USING ((select auth.uid()) = user_id);
    
CREATE POLICY "Users can insert their own study reminders" ON study_reminders
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
    
CREATE POLICY "Users can update their own study reminders" ON study_reminders
    FOR UPDATE USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);
    
CREATE POLICY "Users can delete their own study reminders" ON study_reminders
    FOR DELETE USING ((select auth.uid()) = user_id);
```

## 📊 **Verification Commands**

### **Check All Warnings Are Fixed**
```bash
# Run Supabase linter (if available)
supabase db lint

# Or manually check policy count
psql "your-db-url" -c "
SELECT tablename, COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename 
ORDER BY tablename;"
```

### **Performance Testing**
```sql
-- Before/after comparison
EXPLAIN ANALYZE SELECT * FROM study_reminders LIMIT 100;

-- Check for auth.uid() vs (select auth.uid()) usage
SELECT definition FROM pg_policies 
WHERE schemaname = 'public' 
AND definition LIKE '%auth.uid()%';
```

## 🎉 **Success Indicators**

✅ **Database linter shows 0 warnings**  
✅ **All tables have 1 policy each (instead of 4+)**  
✅ **Queries use `(select auth.uid())` pattern**  
✅ **Application functionality unchanged**  
✅ **Performance improvements measurable**  

## 🔧 **Next Steps After Success**

1. **Update your development workflow**:
   - Always use `(select auth.uid())` in new policies
   - Prefer `FOR ALL` over separate CRUD policies when appropriate

2. **Monitor performance**:
   - Set up query performance monitoring
   - Compare before/after metrics

3. **Documentation**:
   - Update your team's RLS best practices
   - Document the optimization for future reference

---

## 📞 **Need Help?**

If you encounter issues:
1. **Check the error message** - most issues are permission-related
2. **Verify your service role key** has sufficient permissions
3. **Test one table at a time** to isolate problems
4. **Use the rollback procedures** if needed

Remember: **The fixes maintain security while improving performance!** 🚀
