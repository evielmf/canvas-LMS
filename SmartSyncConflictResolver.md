🧠 Feature Prompt: Smart Sync Conflict Resolver
🎯 Objective:
Implement a Smart Sync Conflict Resolver in the Easeboard backend to automatically detect inconsistencies between synced Canvas data (stored in Supabase) and live Canvas API data, then present those discrepancies to the user with actionable options (resolve/ignore).

🧩 Context:
Canvas LMS data (assignments, courses, grades) can become inconsistent over time due to:

Deletion or renaming of assignments on Canvas

Grade changes

Course drops/additions

Canvas API returning updated structure

Time-based drift between cached database and live API

Your system already syncs data every 2 hours and caches it in Supabase. This resolver should intercept differences during sync and provide a way for users to understand and resolve those conflicts — rather than silently overriding, ignoring, or introducing bugs.

✅ Expected Behavior:
1. Conflict Detection Logic
When syncing:

Compare cached data (Supabase) vs live Canvas API data

Detect discrepancies:

Assignment deleted from Canvas but still in DB

Assignment renamed (title mismatch)

Status/grade/points changed

Course dropped but still in cache

Mark as conflict

2. Conflict Table
Create a new sync_conflicts table in Supabase:

sql
Copy
Edit
id (uuid)  
user_id (uuid)  
item_type (enum: assignment, course, grade)  
item_id (string)  
field (string)  
cached_value (json)  
live_value (json)  
status (enum: unresolved, resolved, ignored)  
detected_at (timestamp)  
3. API Endpoint
Create a new REST endpoint:

http
Copy
Edit
GET /api/sync/conflicts
POST /api/sync/conflicts/:id/resolve
POST /api/sync/conflicts/:id/ignore
4. Frontend UI
New section in settings or dashboard alert:

“⚠️ Sync Conflicts Detected”

Show side-by-side comparison:

Cached value vs Live Canvas value

Action buttons: [Resolve] or [Ignore]

On resolve: DB is updated to match Canvas

On ignore: Leave cache untouched and set conflict as “ignored”

5. Optional Enhancements
Auto-resolve “safe” conflicts (e.g., only a title changed)

Auto-notify user when a conflict is detected (toast or notification)

Allow batch resolution of multiple conflicts

🛡️ Benefits
🔐 Increases trust in data accuracy

🔁 Prevents outdated info from appearing in dashboard

🧠 Adds transparency to sync system

📊 Useful for debugging sync issues and error reporting

💻 Suggested Stack
Backend: Extend FastAPI sync worker logic to compare data during sync

Database: Supabase table for sync_conflicts with RLS for user isolation

Frontend: React Query fetch for /api/sync/conflicts + settings modal or card UI