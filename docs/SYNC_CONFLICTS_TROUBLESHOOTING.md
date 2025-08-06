# Sync Conflicts Troubleshooting Guide

## Issue: "No unique or exclusion constraint matching the ON CONFLICT specification"

### Problem
The sync process fails with database constraint errors when trying to store conflicts.

### Solution
Run the database migration to ensure the `sync_conflicts` table is properly set up:

#### Option 1: PowerShell (Windows)
```powershell
.\scripts\run-migration.ps1
```

#### Option 2: Bash (Linux/Mac)
```bash
chmod +x scripts/run-migration.sh
./scripts/run-migration.sh
```

#### Option 3: Manual API Call
```bash
curl -X POST http://localhost:3000/api/migrate \
  -H "Authorization: Bearer migrate-db-2024" \
  -H "Content-Type: application/json"
```

### What the Migration Does
- Creates the `sync_conflicts` table with proper structure
- Sets up Row Level Security (RLS) policies
- Creates necessary indexes for performance
- Adds update triggers for timestamps

## Issue: Conflicts Not Appearing in UI

### Check 1: Database Table Exists
Verify the table was created:
```sql
SELECT * FROM sync_conflicts LIMIT 1;
```

### Check 2: Conflicts Are Being Detected
Check the browser console during sync for messages like:
- "🔍 Detecting course conflicts..."
- "Found X course conflicts"
- "🔍 Processed X sync conflicts..."

### Check 3: API Endpoints Working
Test the conflicts API:
```bash
# Get conflicts (requires authentication)
curl http://localhost:3000/api/sync/conflicts
```

## Issue: Sync Process Hanging or Slow

### Check 1: Database Permissions
Ensure your Supabase user has proper permissions:
- SELECT, INSERT, UPDATE on `sync_conflicts`
- RLS policies are correctly applied

### Check 2: Batch Processing
Large numbers of conflicts are processed in batches of 10 to avoid overwhelming the database.

### Check 3: Error Handling
The conflict detection now uses try-catch blocks to continue even if individual conflicts fail.

## Issue: Auto-Resolution Not Working

### Check 1: Auto-Resolvable Fields
Verify your fields are in the `AUTO_RESOLVABLE_FIELDS` array in `sync-conflict-detector.ts`:
```typescript
const AUTO_RESOLVABLE_FIELDS = [
  'updated_at_canvas',
  'created_at_canvas', 
  'synced_at',
  'workflow_state'
]
```

### Check 2: Resolution Logic
Auto-resolution only works for conflicts that:
- Are in the auto-resolvable fields list
- Are currently in 'unresolved' status
- Belong to the authenticated user

## Issue: Frontend Components Not Showing

### Check 1: Hook Import
Ensure you're importing the hook correctly:
```tsx
import { useSyncConflicts } from '@/hooks/useSyncConflicts'
```

### Check 2: Authentication
The hooks require a valid user session. Check:
```tsx
const { user } = useSupabase()
console.log('User:', user) // Should not be null
```

### Check 3: Component Integration
Use the pre-built integration components:
```tsx
import { DashboardSyncConflictIntegration } from '@/components/sync/SyncConflictIntegration'

// Add to your dashboard
<DashboardSyncConflictIntegration />
```

## Common Error Messages

### "Failed to store sync conflicts"
- **Cause**: Database table doesn't exist or has wrong structure
- **Solution**: Run the migration script

### "Cannot find name 'toast'"
- **Cause**: Missing toast notification library
- **Solution**: The components have been updated to use console logging instead

### "Type 'onClick' does not exist"
- **Cause**: Component prop mismatch
- **Solution**: Use `onClickAction` instead of `onClick`

### "This code has the problem reported: Cannot iterate"
- **Cause**: TypeScript downlevel iteration issue
- **Solution**: Code has been updated to use `Array.from()` for iteration

## Verification Steps

After fixing issues, verify the feature works:

1. **Run Sync**: Click the sync button in your dashboard
2. **Check Console**: Look for conflict detection messages
3. **Check Database**: Query `sync_conflicts` table for new records
4. **Test UI**: Navigate to conflict resolution components
5. **Test Resolution**: Try resolving or ignoring conflicts

## Debug Mode

To get more detailed logging, check these console messages:

```
🔄 Starting automatic Canvas data sync...
🔍 Detecting course conflicts...
Found X course conflicts
🔍 Processing X sync conflicts...
🔍 Stored X new conflicts, updated X existing conflicts
🔧 Auto-resolving X safe conflicts...
✅ Auto-resolved X conflicts
```

## Database Schema Verification

Ensure your `sync_conflicts` table has this structure:

```sql
\d sync_conflicts

-- Should show:
-- id (uuid, primary key)
-- user_id (uuid, foreign key to auth.users)
-- item_type (text, check constraint)
-- item_id (text)
-- field (text) 
-- cached_value (jsonb)
-- live_value (jsonb)
-- status (text, check constraint)
-- detected_at (timestamp with time zone)
-- resolved_at (timestamp with time zone)
-- resolved_by (text)
-- created_at (timestamp with time zone)
-- updated_at (timestamp with time zone)
```

If any issues persist, check the server logs and browser console for additional error details.
