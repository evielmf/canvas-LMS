# Easeboard LMS Integration Redesign Plan

## Table of Contents
1. Overview & Goals
2. Backend Architecture
   - Service Structure
   - Syncing Canvas Data
   - Token Encryption & Security
   - Conflict Handling
3. Frontend Architecture
   - UI/UX Enhancements
   - Component Structure & State Management
4. Sync Strategy
   - Reliable Background Sync
   - Debounce, Schedule, Retry Logic
   - API Throttling & Rate Limit Handling
5. Performance Optimizations
   - Cold Start Reduction
   - FastAPI + Supabase Optimizations
   - Smart Caching
6. Security Best Practices
   - Token Storage & RLS
   - Data Leak Prevention
   - Auth Hardening
7. Scalability & Maintainability
   - Scaling for 10,000+ Users
   - Folder Structures
   - Monorepo vs Split Approach
8. Bonus Features
   - Audit Logging
   - Assignment Versioning
   - PWA Structure

---

## 1. Overview & Goals

Easeboard aims to deliver a calm, Gen-Z friendly dashboard for academic productivity, integrating Canvas LMS data (assignments, grades, calendar, courses) with a modern stack:
- **Frontend:** Next.js 14 (App Router)
- **Backend:** FastAPI + Supabase
- **Data Sync:** Background jobs with Canvas API

This redesign plan outlines best practices for reliability, security, scalability, and delightful UX.

---

## 2. Backend Architecture

### Service Structure
- **API Gateway:** FastAPI as the main entrypoint, with modular routers for each domain (assignments, grades, calendar, courses, auth).
- **Supabase:** Used for authentication, user management, and secure storage (Postgres + RLS).
- **Background Sync Worker:** Separate service/process for scheduled Canvas API syncs (Celery, APScheduler, or Supabase Edge Functions).
- **Task Queue:** Use Redis or Supabase Edge Functions for async jobs and retries.

**Diagram:**
```
[Client] ⇄ [FastAPI API Gateway] ⇄ [Supabase DB]
           ↑           ↓
     [Background Sync Worker]
```

### Syncing Canvas Data
- **Domain Routers:** `/assignments`, `/grades`, `/calendar`, `/courses` endpoints.
- **Sync Logic:**
  - Store last sync timestamp per user.
  - Fetch only deltas (new/updated/deleted) from Canvas API.
  - Use upsert logic for assignments/grades.
  - Mark deleted/renamed items with status flags (soft delete, versioning).
- **Data Model Example:**
```python
# assignments table
id | user_id | canvas_id | name | due_date | status | version | updated_at
```

### Token Encryption & Security
- **Encryption at Rest:**
  - Store Canvas tokens encrypted in Supabase (pgcrypto or Supabase Vault).
  - Never expose tokens to frontend.
- **Access Control:**
  - Use Supabase Row Level Security (RLS) to restrict access by user_id.
- **Rotation & Expiry:**
  - Track token expiration, prompt user to re-authenticate.

### Conflict Handling
- **Deleted Assignments:**
  - Mark as `deleted` in DB, retain for audit/versioning.
- **Renamed Courses:**
  - Store previous names in a `course_versions` table.
- **Sync History:**
  - Log all sync actions for audit/debugging.

---

## 3. Frontend Architecture

### UI/UX Enhancements
- **Dashboard Layout:**
  - Calm, minimal, Gen-Z friendly (soft colors, whitespace, clear typography).
  - Modular widgets: Assignments, Grades, Calendar, Courses.
- **Charts & Visuals:**
  - Use [Recharts](https://recharts.org/) or [Victory](https://formidable.com/open-source/victory/) for grade trends, progress charts.
- **Schedule View:**
  - Calendar integration (e.g., [react-big-calendar](https://github.com/jquense/react-big-calendar)).
- **Responsive Design:**
  - Mobile-first, PWA-ready.

### Component Structure & State Management
- **Atomic Design:**
  - Organize components by atoms, molecules, organisms (see suggested structure below).
- **State Management:**
  - Use [Zustand](https://zustand-demo.pmnd.rs/) for global state (user, sync status).
  - Use [React Query](https://tanstack.com/query/latest) for data fetching, caching, and background sync.
- **Context API:**
  - For theme, auth, and global settings.

**Example Structure:**
```
components/
  ui/
    Button.tsx
    Card.tsx
  dashboard/
    AssignmentList.tsx
    GradeChart.tsx
    CalendarView.tsx
  auth/
    LoginForm.tsx
    TokenStatus.tsx
```

---

## 4. Sync Strategy

### Reliable Background Sync
- **Worker Process:**
  - Use APScheduler (Python) or Supabase Edge Functions for scheduled syncs.
  - Sync every X minutes, configurable per user.
- **Debounce & Retry Logic:**
  - Debounce rapid sync requests (avoid duplicate jobs).
  - Exponential backoff for failed syncs.
- **API Throttling & Rate Limit Handling:**
  - Respect Canvas API rate limits (read from headers).
  - Queue jobs if limits are hit, notify user if sync delayed.

**Sample Python (APScheduler):**
```python
from apscheduler.schedulers.background import BackgroundScheduler

def sync_canvas_data(user_id):
    # ...sync logic...

scheduler = BackgroundScheduler()
scheduler.add_job(sync_canvas_data, 'interval', minutes=15, args=[user_id])
scheduler.start()
```

---

## 5. Performance Optimizations

### Reducing Cold Start Time
- **FastAPI:**
  - Use Uvicorn with workers, preload models.
  - Optimize imports, lazy load heavy modules.
- **Supabase:**
  - Use connection pooling.
  - Index frequently queried columns.

### FastAPI + Supabase Optimizations
- **Async Endpoints:**
  - Use async/await for all I/O operations.
- **Bulk Operations:**
  - Batch DB writes during sync.
- **Smart Caching:**
  - Cache Canvas API responses (Redis, Supabase cache tables).
  - Use ETag/If-Modified-Since for Canvas API calls.

---

## 6. Security Best Practices

### Canvas Token Storage
- **Encryption at Rest:**
  - Use pgcrypto or Supabase Vault for token encryption.
- **Row Level Security (RLS):**
  - Restrict token access to owner only.

### Prevent Data Leaks & Auth Issues
- **Never expose tokens to frontend.**
- **Validate all API inputs.**
- **Use HTTPS everywhere.**
- **Audit logs for all sensitive actions.**

---

## 7. Scalability & Maintainability

### Scaling for 10,000+ Users
- **Stateless API:**
  - Scale FastAPI horizontally (multiple instances).
- **Supabase:**
  - Use read replicas for heavy queries.
- **Task Queue:**
  - Use Redis/Supabase Edge Functions for distributed sync jobs.
- **Monitoring:**
  - Use Prometheus/Grafana for metrics.

### Suggested Folder Structures

**Backend:**
```
backend/
  main.py
  api/
    assignments.py
    grades.py
    calendar.py
    courses.py
    auth.py
  models/
    assignment.py
    grade.py
    calendar.py
    course.py
    user.py
  sync/
    worker.py
    scheduler.py
  utils/
    canvas_api.py
    encryption.py
  tests/
```

**Frontend:**
```
app/
  layout.tsx
  page.tsx
  providers.tsx
  components/
    ui/
    dashboard/
    auth/
  hooks/
  lib/
  public/
  styles/
```

### Monorepo vs Split Approach
- **Monorepo:**
  - Easier for shared types, CI/CD, unified versioning.
  - Use [Turborepo](https://turbo.build/) or [Nx](https://nx.dev/) for management.
- **Split:**
  - Use if teams are fully independent or scale demands isolation.
- **Recommendation:**
  - Start with monorepo for unified dev experience.

---

## 8. Bonus Features

### Audit Logging
- **Sync History:**
  - Log all sync actions, token events, errors.
  - Expose audit logs in admin dashboard.

### Assignment Versioning
- **Track Changes:**
  - Store assignment versions, show diffs over time.

### Progressive Web App (PWA)
- **Structure:**
  - Add manifest.json, service worker.
  - Use Next.js PWA plugins.
  - Offline support for dashboard.

---

## References & Further Reading
- [Canvas LMS API Docs](https://canvas.instructure.com/doc/api/)
- [FastAPI Best Practices](https://fastapi.tiangolo.com/)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Next.js App Router](https://nextjs.org/docs/app/building-your-application/routing)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Query](https://tanstack.com/query/latest)
- [APScheduler](https://apscheduler.readthedocs.io/en/latest/)
- [Turborepo](https://turbo.build/)

---

## Summary
This redesign plan provides a robust, scalable, and secure foundation for Easeboard's Canvas LMS integration. Follow these guidelines to deliver a delightful, high-performance dashboard for academic productivity.
