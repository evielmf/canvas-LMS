# Smart Sync Conflict Resolver

## Overview

The Smart Sync Conflict Resolver automatically detects inconsistencies between your cached Canvas LMS data and live Canvas API data, providing users with actionable options to resolve conflicts.

## Features

✅ **Automatic Conflict Detection** - Compares cached vs live data during sync  
✅ **Smart Categorization** - Auto-resolvable vs user-input conflicts  
✅ **Database Storage** - Tracks conflicts with full audit trail  
✅ **RESTful API** - Complete endpoints for conflict management  
✅ **React Components** - Ready-to-use UI components  
✅ **Batch Operations** - Resolve multiple conflicts at once  

## Architecture

### Backend Components

- **`lib/sync-conflict-detector.ts`** - Core conflict detection logic
- **`app/api/sync/conflicts/route.ts`** - Main conflicts API endpoint
- **`app/api/sync/conflicts/[id]/resolve/route.ts`** - Individual conflict resolution
- **`app/api/sync/conflicts/[id]/ignore/route.ts`** - Individual conflict ignoring
- **`supabase/sync_conflicts_table.sql`** - Database schema

### Frontend Components

- **`hooks/useSyncConflicts.ts`** - React hook for conflict management
- **`components/sync/SyncConflictResolver.tsx`** - Main conflict resolution UI
- **`components/sync/SyncConflictAlert.tsx`** - Notification components
- **`components/sync/SyncConflictIntegration.tsx`** - Integration helpers

## API Endpoints

### Get Conflicts
```http
GET /api/sync/conflicts
Query Parameters:
- status: 'unresolved' | 'resolved' | 'ignored' (default: 'unresolved')
- item_type: 'assignment' | 'course' | 'grade'
- limit: number (default: 50)
- offset: number (default: 0)
```

### Batch Resolve/Ignore
```http
POST /api/sync/conflicts
Body: {
  "conflictIds": ["uuid1", "uuid2"],
  "action": "resolve" | "ignore",
  "batchResolve": boolean
}
```

### Individual Actions
```http
POST /api/sync/conflicts/{id}/resolve
POST /api/sync/conflicts/{id}/ignore
```

## Integration Guide

### 1. Add to Dashboard

Add conflict alerts to your main dashboard:

```tsx
import { DashboardSyncConflictIntegration } from '@/components/sync/SyncConflictIntegration'

export function Dashboard() {
  return (
    <div>
      <DashboardSyncConflictIntegration />
      {/* Your existing dashboard content */}
    </div>
  )
}
```

### 2. Add to Header/Navigation

Add a conflict indicator badge:

```tsx
import { HeaderSyncConflictBadge } from '@/components/sync/SyncConflictIntegration'

export function Header() {
  return (
    <header>
      {/* Your navigation */}
      <HeaderSyncConflictBadge />
    </header>
  )
}
```

### 3. Settings Page

Create a dedicated sync management page:

```tsx
import { SyncConflictSettingsPage } from '@/components/sync/SyncConflictSettingsPage'

export default function SyncSettings() {
  return <SyncConflictSettingsPage />
}
```

## How It Works

### 1. Conflict Detection

During Canvas sync (`/api/canvas/sync`), the system:

1. Fetches live data from Canvas API
2. Compares with cached data in Supabase
3. Detects differences using `detectCourseConflicts()` and `detectAssignmentConflicts()`
4. Categorizes conflicts as auto-resolvable or requiring user input
5. Stores conflicts in `sync_conflicts` table

### 2. Auto-Resolution

Safe conflicts are automatically resolved:
- Timestamp updates (`updated_at_canvas`, `created_at_canvas`)
- Sync metadata (`synced_at`)
- Workflow state changes (in most cases)

### 3. User Resolution

Critical conflicts require user decision:
- Name changes
- Due date changes
- Point values
- Grade scores
- Item deletions

### 4. Conflict Types

**Assignment Conflicts:**
- Deleted from Canvas but still in cache
- New assignments on Canvas not in cache
- Field changes (name, due_date, points_possible, etc.)

**Course Conflicts:**
- Course dropped but still in cache
- New course enrollments
- Course information changes

**Grade Conflicts:**
- Score changes
- Submission status changes

## Database Schema

```sql
CREATE TABLE sync_conflicts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    item_type TEXT CHECK (item_type IN ('assignment', 'course', 'grade')),
    item_id TEXT, -- Canvas item ID
    field TEXT, -- Field with conflict
    cached_value JSONB, -- Current cached value
    live_value JSONB, -- Live Canvas value
    status TEXT DEFAULT 'unresolved',
    detected_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    resolved_by TEXT -- 'user', 'auto', 'system'
);
```

## React Hook Usage

```tsx
import { useSyncConflicts } from '@/hooks/useSyncConflicts'

function ConflictManager() {
  const {
    conflicts,
    summary,
    hasUnresolvedConflicts,
    resolveConflict,
    ignoreConflict,
    batchResolve,
    isResolving
  } = useSyncConflicts()

  const handleResolve = async (conflictId: string) => {
    await resolveConflict(conflictId)
  }

  return (
    <div>
      {hasUnresolvedConflicts && (
        <div>⚠️ {summary.total_unresolved} conflicts need attention</div>
      )}
      {/* Render conflicts */}
    </div>
  )
}
```

## Configuration

### Auto-Resolution Fields
Modify `AUTO_RESOLVABLE_FIELDS` in `sync-conflict-detector.ts`:

```typescript
const AUTO_RESOLVABLE_FIELDS = [
  'updated_at_canvas',
  'created_at_canvas',
  'synced_at',
  'workflow_state' // Add/remove fields as needed
]
```

### Critical Fields
Modify `CRITICAL_FIELDS` for fields that always require user input:

```typescript
const CRITICAL_FIELDS = [
  'name',
  'due_at',
  'points_possible',
  'description',
  'score',
  'submitted_at'
]
```

## Troubleshooting

### No Conflicts Detected
- Check that sync is running with the updated conflict detection code
- Verify database table exists: `sync_conflicts`
- Check browser console for API errors

### Conflicts Not Resolving
- Verify user permissions on database tables
- Check API endpoint logs
- Ensure cached data exists to compare against

### Performance Issues
- Use pagination for large numbers of conflicts
- Consider auto-resolving more field types
- Add database indexes for frequently queried fields

## Security

- **Row Level Security (RLS)** - Users can only see their own conflicts
- **Authentication** - All endpoints require valid session
- **Input Validation** - Conflict IDs and actions are validated
- **Audit Trail** - All resolutions are logged with timestamps

## Future Enhancements

- **Email notifications** for critical conflicts
- **Conflict resolution history** dashboard
- **Advanced filtering** and search
- **Conflict prevention** through better validation
- **API rate limiting** for batch operations
- **Integration with Canvas webhooks** for real-time detection
