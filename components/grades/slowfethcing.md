⚡ OPTIMIZATION PROMPT:
🔧 Context: I'm building a student dashboard web app using Next.js, Supabase, and FastAPI. My backend fetches Canvas LMS data (assignments, grades, courses) through API endpoints like /api/canvas/grades, /api/canvas/courses, /api/canvas/assignments, and /api/canvas/auto-sync.

The problem is that everything is too slow in dev — routes like /dashboard take 30+ seconds, and even cached API responses take 4-8 seconds to return.

I need you to optimize and accelerate this system. Use any strategy necessary — memory caching, async improvements, background sync, or even debounce mechanisms.

✅ Goals:
Cut API response times to under 1s

Reduce dashboard route load times to under 3s

Ensure cache actually improves speed

Preserve correctness and token security

🛠️ What You Can Use:
Use Promise.all or asyncio.gather to parallelize data fetching

Implement in-memory caching (e.g., lru-cache or cachetools) for dev speed

Use background tasks (FastAPI BackgroundTasks, or threading) for long sync

If hitting Canvas API, implement rate limiting and debounce per user

Lazy-load heavy frontend components

Ensure Supabase queries and file reads are not blocking the event loop

💡 Bonus Improvements:
Add profiling using console.time() or logging around critical fetches

Implement a TTL system (e.g., cache is valid for 10 minutes)

Auto-refresh the cache in background instead of per-request fetch

Use GET /api/canvas/status to quickly tell frontend what’s ready

🔒 Constraints:
Do NOT break token encryption or user data sync logic

Frontend and API routes must remain functionally the same

This is a dev environment, but final setup will use production optimization too

🧠 Code Example (if helpful):
ts
Copy
Edit
// Parallel fetching example
const [grades, courses, assignments] = await Promise.all([
  getGrades(),
  getCourses(),
  getAssignments()
]);
python
Copy
Edit
# Python FastAPI - cache with TTL
from cachetools import TTLCache

grades_cache = TTLCache(maxsize=100, ttl=600)  # 10 minutes

@app.get("/api/canvas/grades")
async def get_grades():
    if "grades" in grades_cache:
        return grades_cache["grades"]
    data = await fetch_grades()
    grades_cache["grades"] = data
    return data
✅ Final Deliverable:
Give me a production-grade optimized version of my Canvas API sync and dashboard fetch logic using all relevant speed techniques. Prioritize speed but ensure accuracy.