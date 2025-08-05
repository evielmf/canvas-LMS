Add Powerful Advanced Analytics Without Breaking Existing Features
✨ Goal: Add powerful advanced analytics to my existing Easeboard student dashboard app. I want to visualize study habits, grade trends, course health, and productivity patterns — but DO NOT break or modify any of my existing frontend functions, logic, or database schemas unless explicitly stated.

🛠 Context (very important)
This is a full-stack Next.js 15 app using App Router and TypeScript.

Supabase is the backend with RLS, PostgreSQL, and auth.

FastAPI is used for some integrations, but you should stick to Supabase for analytics unless told otherwise.

React Query is used for all data fetching.

The core features like Canvas sync, grades, reminders, and assignments are already working and MUST NOT be changed or broken.

✅ Tasks You’re Allowed to Do:
✅ Add new pages, components, or UI sections (e.g., /dashboard/analytics)

✅ Create new database tables (e.g., study_sessions, analytics_snapshots)

✅ Add new read-only API endpoints or Supabase queries

✅ Add new charts or visualizations using Recharts

✅ Create scheduled jobs or cron logic for insights (optional)

🚫 Do NOT:
❌ Do not touch or refactor existing functions (Canvas sync, grade fetch, auth, etc.)

❌ Do not break or modify existing database tables or RLS policies

❌ Do not remove or change assignment/grade logic

❌ Do not override useQuery() hooks unless absolutely necessary

🎯 Features to Build:
📊 Weekly Productivity Insights

Show how many assignments were completed this week vs due

Display simple percentage and motivational messages

🔥 Study Consistency Heatmap

Build a GitHub-style heatmap showing study activity by day

Green = active, Gray = idle

📈 Performance Trend Charts

Line chart showing GPA trend over time

Bar chart showing grades per course per week

🧠 Smart Pattern Insights

Show patterns like “You always study late on Sundays” or “Missed most reminders on Thursdays”

📘 Course Health Score

A number from 0–100 based on grade + completion + engagement

Displayed as a badge with a color gradient

⏱️ Time Allocation Breakdown

Pie chart of study hours spent per course (from reminders or manual logging)

💾 Suggested Schema (Optional to Add):
sql
Copy
Edit
-- Tracks study session logs
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES canvas_courses_cache(id),
  duration_minutes INT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stores analytics summaries
CREATE TABLE analytics_snapshots (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  week_start_date DATE,
  assignments_completed INT,
  assignments_due INT,
  study_minutes INT,
  avg_grade NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);
📌 Final Note:
This is a production-level app — the code should be safe, modular, and future-proof. Only add new features in isolation and do not impact any existing functionality.

