# Canvas LMS Dashboard — Rebuild Blueprint

Date: 2025-08-09

This blueprint documents the current system and provides a clear plan to rebuild it cleanly with a modern, scalable structure.

---

## 1) High-level overview

- Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS, React Query, Supabase (auth + data), Recharts, Lucide icons, PWA (next-pwa).
- App model: Auth-gated dashboard with routes for assignments, grades, schedule, and settings. Data fetched via internal API routes (app/api/*) that use Supabase; Canvas data cached client-side via React Query.

---

## 2) Folder and component structure

Top-level highlights:
- `app/`
  - `layout.tsx`: global HTML shell, Inter font, Toaster config, metadata/viewport, `ChunkErrorBoundary`, and `Providers` wrapper.
  - `providers.tsx`: React Query setup + Supabase client/context + auth state handling.
  - `page.tsx`: root routing (redirects to `/dashboard` if signed in; else `AuthPage`).
  - `dashboard/`
    - `page.tsx`: renders `DashboardOverview`.
    - `assignments/page.tsx`: renders `AssignmentsView`.
    - `grades/page.tsx`: renders `GradesView`.
    - `schedule/page.tsx`: renders `ScheduleView`.
    - `settings/page.tsx`: renders `SettingsView`.
  - `api/`
    - `canvas/...`: routes for Canvas resources (courses, assignments, grades, sync, tokens, etc.).
    - `schedule/route.ts`: CRUD for `weekly_schedule` table per user.
    - `analytics/`, `debug/`, `migrate/`, `sync/`: support endpoints.
  - `privacy/page.tsx`, `terms/page.tsx`: legal pages (dark theme).
  - `globals.css`: Tailwind base + custom CSS vars (sage, lavender, etc.).
- `components/`
  - `auth/`: `AuthPage` (marketing + sign-in).
  - `dashboard/`: nav (Sidebar, DashboardNav), overview widgets, charts, mobile nav, token & data managers, FAB, etc.
  - `assignments/`: `AssignmentsView` (list, filters, mobile-optimized).
  - `grades/`: `GradesView` (charts, table, course name mapping).
  - `schedule/`: `ScheduleView` (+ `ScheduleView.css`) for weekly schedule CRUD.
  - `settings/`: `SettingsView`, `CourseNameMappingManager`.
  - `ui/`: Base UI primitives (button, card, tabs, alert, badge, input, label, progress), utilities (`BottomSheet`, `PullToRefresh`), loading/skeletons, `ChunkErrorBoundary`, `PerformanceMonitor`.
- `hooks/`: Data fetching and utilities (`useCanvasDataCached`, `useCanvasData`, `useCanvasToken`, `useCanvasSync`, `useUniversalPrefetch`, `useCourseNameMappings`, `useAnalyticsData`, etc.).
- `utils/`
  - `supabase/{client,server}.ts`: browser/server clients via `@supabase/ssr`.
  - `auth-helpers.ts`: clear auth storage, detect auth errors.
  - `course-name-mapper.ts`: normalize/alias course names (used in Grades and Settings).
- `tailwind.config.js`: theme extension (colors, fonts, radii, font sizes, shadows, animations, gradients, utilities).
- `next.config.js`: `next-pwa`, turbopack rules, optimization splits and vendor chunking.
- `package.json`: dependencies (see section 9).
- `docs/`: design/feature/optimization plans and reports.

---

## 3) Page routing and navigation flow

App Router hierarchy:
- `/` → `app/page.tsx`
  - Server checks Supabase auth:
    - Signed in → redirect `/dashboard`
    - Not signed in → render `AuthPage`
- `/dashboard` → `DashboardOverview`
- `/dashboard/assignments` → `AssignmentsView`
- `/dashboard/grades` → `GradesView`
- `/dashboard/schedule` → `ScheduleView`
- `/dashboard/settings` → `SettingsView`
- `/privacy`, `/terms` → static legal pages

Navigation:
- Desktop: `Sidebar.tsx` + `TopHeader.tsx`; prefetch via `useUniversalPrefetch`; sign-out via Supabase.
- Mobile: `MobileBottomNav.tsx` and a FAB for quick actions; BottomSheet for filters.
- Toaster: `react-hot-toast` provider configured in RootLayout.

---

## 4) Reusable UI components and purpose

- Base primitives (`components/ui`): `button`, `card`, `tabs`, `alert`, `badge`, `input`, `label`, `progress` for consistent styling.
- Overlays/utilities: `BottomSheet` (mobile filters), `PullToRefresh`, `ChunkErrorBoundary`, `PerformanceMonitor`.
- Dashboard: `Sidebar`, `DashboardNav`, `MobileBottomNav`, `TopHeader`, `FloatingActionButton`, widget components.
- Assignments: `AssignmentCard`, `MobileAssignmentCard`.
- Grades: `GradeChart` (Recharts), mapping manager modal.
- Settings: `CourseNameMappingManager`.
- Schedule: `ScheduleView` with `ScheduleItemCard` and modal form (embedded), color-coded items.

Patterns reused:
- Search + filter bars with icons.
- Stats cards grid.
- Mobile BottomSheet filters; desktop inline filters.
- FAB for sync/add actions.
- Friendly empty states with icons + CTAs.

---

## 5) Styling system and design tokens

Tailwind + CSS variables:
- Fonts: Inter (body), Sora (headings) via Google Fonts. Tailwind font families wired in `tailwind.config.js`.
- Palette (globals + Tailwind extend): `sage`, `lavender`, `cream`, `soft-blue`, `warm-gray`, plus `primary/secondary` HSL vars; Canvas brand references.
- Radii: button 8px, card 12px, etc. (`--radius` based sizes).
- Typography scale: custom `heading-h1..h5`, `text-medium/regular/small` with tuned line-height/weights.
- Backgrounds/gradients: `gradient-calm`, `gradient-sage`, `gradient-soft`.
- Shadows/animations: soft shadows, `floating`, `soft-pulse`, `tailwindcss-animate`.
- Utilities: custom `line-clamp-1/2/3`, dark mode via class.

Role of Tailwind:
- Primary styling mechanism with extended theme tokens. Minimal custom CSS (only `ScheduleView.css` for color hooks).

---

## 6) Key UI/UX patterns, layouts, and page structures

- Global layout: RootLayout with Toaster, Providers, PWA meta.
- Dashboard: widget grid, charts, lists; Sidebar navigation; mobile alternatives; PullToRefresh.
- Assignments: stats, filters, responsive cards, BottomSheet on mobile.
- Grades: summary stats, bar/pie charts, filter and table, course name mapping prompt.
- Schedule: weekly grid + list toggle, week navigation, today highlight, CRUD modal, color coding.
- Settings: token/data management, mapping tools.
- Feedback: consistent toasts; skeleton loaders for perceived speed.

---

## 7) Core features, API integrations, and business logic to keep

- Auth + context: Supabase SSR/browser clients via `@supabase/ssr`; `Providers` exposes `supabase` + `user`; handles auth state changes and invalid tokens.
- Canvas data ingestion and caching: `app/api/canvas/*` endpoints for courses/assignments/grades; client hooks fetch via React Query; manual sync updates cache.
- Schedule management: `app/api/schedule/route.ts` exposes GET/POST/PUT/DELETE for user-scoped `weekly_schedule`; `ScheduleView` performs CRUD via fetch.
- Course name mapping: utilities + settings manager; applied in Grades (and can be applied to Assignments).
- Analytics/visualization: Recharts for course averages + grade distribution; client-side stats.
- Performance/polish: PWA via `next-pwa`, chunk splitting, optimize package imports, SVG handling, console removal in prod.

---

## 8) Accessibility considerations

Strengths:
- Labeled inputs and `aria-label`s on icon buttons.
- Focus rings with Tailwind; semantic headings; large touch targets.

Improvements:
- Ensure contrast on light backgrounds; verify palette pairs.
- Add focus trap and `aria-modal` to `BottomSheet` and the schedule modal; Escape to close; restore focus to trigger.
- Add `aria-live` for toasts.
- Add skip-to-content link in layout.
- Improve Grades table semantics (`scope`, caption, etc.).

---

## 9) Dependencies and roles

Runtime:
- `next`: App Router framework.
- `react`, `react-dom`: UI.
- `@tanstack/react-query`: data fetching/cache with retries and backoff.
- `@supabase/ssr`, `@supabase/supabase-js`: auth + data access (SSR + client).
- `tailwindcss`, `tailwindcss-animate`, `tailwind-merge`, `postcss`, `autoprefixer`: styling system.
- `lucide-react`: icons.
- `recharts`: charts.
- `date-fns`: date formatting/comparisons.
- `react-hot-toast`: toasts (note: `sonner` also present — consolidate).
- `framer-motion`: animations (e.g., Sidebar).
- `class-variance-authority`, `clsx`: class composition.
- `next-pwa`: PWA integration.
- `lru-cache`, `p-debounce`: performance helpers.
- `crypto-js`: encryption (token handling).
- `dotenv`: env handling.

Dev:
- `typescript`, `@types/*`, `eslint`, `eslint-config-next`, `webpack-cli`.

---

## 10) Suggested improvements

Code quality and consistency:
- Unify toast library: pick `react-hot-toast` or `sonner`; remove the other; align all calls and theming.
- Fix duplication in `ScheduleView.tsx`: duplicate state/functions (e.g., `searchQuery`, `selectedDay`, `isMobile`, `viewMode`, `currentWeekOffset`, `deleteScheduleItem`; plus both `fetchScheduleItems` and `loadSchedule`). Consolidate and always use `/api/schedule` path.
- Centralize shared types (Assignment, Course, Grade, ScheduleItem) under `types/` and reuse across hooks/components/routes.

API contracts and validation:
- Standardize API responses `{ success, data, error? }` and error mapping.
- Add Zod schemas for request/response validation in routes.

Auth and routing:
- Add `middleware.ts` to protect `/dashboard/*` and redirect unauthenticated users.

Performance:
- Memoize lists and consider virtualization for long tables.
- Lazy-load heavy charts and only on client.

Styling:
- Replace `ScheduleView.css` color hex duplication with Tailwind tokens or CSS variables; avoid hard-coded hex values.
- Extract shared page headers and stat cards as reusable components.

Accessibility:
- Focus trap + keyboard handling in overlays; improve table semantics; add skip links.

Testing/devex:
- Add unit tests for mappers and hooks; route tests for API.
- Add env schema docs and example `.env.local`.

---

## 11) Proposed new folder/component structure

Adopt a feature-first layout with shared UI primitives and types.

```
src/
  app/
    (public)/privacy/page.tsx
    (public)/terms/page.tsx
    (auth)/page.tsx
    (dashboard)/
      layout.tsx
      page.tsx
      assignments/page.tsx
      grades/page.tsx
      schedule/page.tsx
      settings/page.tsx
    api/
      canvas/
        courses/route.ts
        assignments/route.ts
        grades/route.ts
        sync/route.ts
        tokens/route.ts
      schedule/route.ts
  features/
    auth/
      components/AuthPage.tsx
      hooks/useAuth.ts
    assignments/
      components/{AssignmentCard, MobileAssignmentCard, AssignmentsView}.tsx
      hooks/useAssignments.ts
      types.ts
    grades/
      components/{GradeChart, GradesView}.tsx
      hooks/useGrades.ts
      types.ts
    schedule/
      components/{ScheduleView, ScheduleItemCard, ScheduleFormModal}.tsx
      hooks/useSchedule.ts
      types.ts
    settings/
      components/{SettingsView, CourseNameMappingManager}.tsx
      hooks/useCourseNameMappings.ts
      types.ts
    dashboard/
      components/{Sidebar, TopHeader, SyncStatusWidget, UpcomingReminders, FloatingActionButton}.tsx
  ui/
    primitives/{button, card, input, label, tabs, alert, badge, progress}.tsx
    overlay/{BottomSheet, Modal}.tsx
    feedback/{ToasterProvider, Skeleton, Loading}.tsx
    utils/{PullToRefresh, ChunkErrorBoundary, PerformanceMonitor}.tsx
  hooks/
    useSupabaseClient.ts
    useUniversalPrefetch.ts
  lib/
    supabase/{client, server}.ts
    auth/auth-helpers.ts
    canvas/course-name-mapper.ts
  styles/
    globals.css
  types/
    canvas.ts
    schedule.ts
  config/
    env.ts
  tests/
    unit/*
    api/*
```

Notes:
- Co-locate feature hooks/types/components inside `features/*`.
- Keep UI primitives generic and style-consistent.
- Introduce a single Toaster provider.
- Add `middleware.ts` for route protection.

---

## 12) API surface summary

- `/api/canvas/*`
  - `courses` GET → `{ courses: CanvasCourse[] }`
  - `assignments` GET → `{ assignments: CanvasAssignment[] }`
  - `grades` GET → `{ grades: CanvasGrade[] }`
  - `sync`, `tokens` → refresh and token state (as implemented)
- `/api/schedule`
  - GET → `{ scheduleItems, count }`
  - POST → create item; required: `title`, `day_of_week`, `start_time`, `end_time`; optional: `course_name`, `location`, `color`
  - PUT → update by `id` (user-scoped)
  - DELETE → delete by `id` (user-scoped)

All routes use Supabase SSR client and user scoping; add zod validation and explicit status codes/messages.

---

## 13) Risks and edge cases

- Auth token invalidation: handle via `isAuthError` + storage clear; redirect unauthenticated.
- Large datasets: virtualize long lists/tables; throttle filters; paginate if needed.
- Time zones: standardize due dates/schedule with user TZ (date-fns).
- Offline/PWA: provide API fallbacks and offline banners.
- Accessibility in overlays and toasts; avoid keyboard traps.

---

## 14) Migration checklist

1. Repository groundwork
   - [ ] Create `src/` and adopt feature-first layout (see section 11).
   - [ ] Move `app/` into `src/app/` and update tsconfig baseUrl/paths if needed.
   - [ ] Create `types/` and extract shared types (Assignment, Course, Grade, ScheduleItem).

2. Providers and layout
   - [ ] Keep `Providers` but move to `src/app/providers.tsx`; expose `supabase` + `user`.
   - [ ] Add `middleware.ts` to protect `/dashboard/*` (redirect when unauthenticated).
   - [ ] Add a skip-to-content link in `RootLayout`.

3. API contracts and validation
   - [ ] Add Zod schemas per route input/output.
   - [ ] Normalize API responses: `{ success, data, error? }`.
   - [ ] Ensure all routes use the SSR Supabase client and explicit user scoping.

4. Schedule feature cleanup
   - [ ] Consolidate `ScheduleView` duplicate state/functions; remove mock `loadSchedule` path.
   - [ ] Use `/api/schedule` exclusively for CRUD; optimistic updates + React Query mutation hooks.
   - [ ] Extract `ScheduleItemCard` and `ScheduleFormModal` into separate files.
   - [ ] Replace `ScheduleView.css` hex color selectors with Tailwind tokens or CSS variables.

5. Assignments and grades
   - [ ] Centralize filtering/sorting logic; memoize heavy computations.
   - [ ] Lazy-load charts and large components.
   - [ ] Ensure course name mapping is applied consistently across views.

6. UI primitives and toasts
   - [ ] Standardize on a single toast library (recommend `react-hot-toast`); remove the other.
   - [ ] Add a `ToasterProvider` in `ui/feedback` with theme bound to Tailwind tokens.

7. Accessibility and overlays
   - [ ] Add focus trap, Escape handling, and `aria-modal` to BottomSheet and modals.
   - [ ] Improve table semantics (caption, scope, headers associations).

8. Performance
   - [ ] Virtualize long lists/tables if counts exceed thresholds.
   - [ ] Verify `next.config.js` chunk splits and PWA caching are effective; adjust as needed.

9. Testing and CI
   - [ ] Add unit tests for `course-name-mapper` and feature hooks.
   - [ ] Add route tests for `/api/schedule` and `/api/canvas/*`.
   - [ ] Add lint/type checks to CI.

10. Documentation and env
   - [ ] Document required env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
   - [ ] Add `.env.local.example` and a short “How to run” in README.

---

## 15) Rebuild notes

- Keep the visual personality (calm palette, generous spacing, friendly copy), but prefer tokens and shared primitives over page-local styles.
- Favor small client components with server data gateways (API routes + SSR auth check).
- Validate inputs/outputs at the edges (API routes) and keep UI lightweight.
