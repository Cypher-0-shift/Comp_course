# Phase 1: Foundation & Authentication - Design Context

## Decisions Captured

### 1. Admin User Creation (Decided)
- **Method**: SQL seed script run once during Supabase project setup
- **Roles**: HOD and Dean distinguished at auth level (stored in `app_metadata.role`)
- **Permissions difference**: Dean sees all departments; HOD sees only their assigned department (via `app_metadata.department_id`)

### 2. Folder Structure (Decided)
- **Pattern**: Feature-based organization
- **Structure**:
  ```
  src/
  ├── features/
  │   ├── auth/
  │   ├── student-portal/
  │   ├── faculty-dashboard/
  │   └── admin-portal/
  ├── shared/
  │   ├── components/
  │   ├── hooks/
  │   ├── utils/
  │   └── types/
  ├── app/
  │   ├── routes/
  │   ├── layouts/
  │   └── providers/
  ```
- **Naming**: kebab-case for folders, PascalCase for components

### 3. Supabase Configuration (Decided)
- **JWT expiry**: Defaults (1hr access, 30 days refresh)
- **Email confirmations**: Required (verify before login)
- **Role storage**: `app_metadata` for role + `department_id` (secure, not user-editable)
- **Session handling**: Defaults (`persistSession: true`, `autoRefreshToken: true`)
- **PKCE**: Enabled (default)
- **Rate limiting**: Default Supabase limits
- **Social providers**: Email/password only for v1
- **Client wrapper**: Custom `useSupabase()` hook with TypeScript types, auth helpers, role-based helpers

### 4. Academic Year Handling (Decided)
- **Pattern**: Separate `academic_years` reference table + FK on relevant tables
- **Schema**: `academic_years` table with `id`, `start_year` (int), `end_year` (int), `is_active`, `label` (computed "2025-26")
- **Tables with FK**: `students`, `faculty`, `subjects`, `enrollments`, `departments` all have `academic_year_id`
- **Use case**: Historical data preserved, active year for default filtering, students/faculty can span multiple years via enrollments
- **Admin upload**: Specifies academic year for imports

### 5. RLS Policy Details (Decided)
- **Faculty assignment**: `faculty_subjects` junction table (many-to-many)
- **Student enrollment**: `enrollments` table with student_id, subject_id, academic_year_id, status
- **Student RLS**: `auth.uid() = student_id` (via students.user_id = auth.uid())
- **Faculty RLS**: Join `enrollments` → `subjects` → `faculty_subjects` WHERE `faculty_subjects.faculty_id = auth.uid()` (via faculty.user_id = auth.uid())
- **HOD RLS**: Join `enrollments` → `subjects` → `departments` WHERE `departments.id = app_metadata.department_id`
- **Dean RLS**: No restriction (see all)
- **Reference tables** (`subjects`, `faculty`, `departments`, `academic_years`): SELECT policy for all authenticated users
- **Restricted tables** (`students`, `enrollments`, `faculty_subjects`): Role-based policies
- **Service role bypass**: Admin Excel upload uses `service_role` key server-side (Edge Function) to bypass RLS
- **User linking**: `faculty.user_id` → `auth.users.id`, `students.user_id` → `auth.users.id`

### 6. Session Persistence (Decided)
- **Remember me checkbox**: No (Supabase 30-day refresh token covers this)
- **Auto-refresh**: Default (`autoRefreshToken: true`)
- **Tab sync**: Default (Supabase storage events)
- **Idle timeout**: **30 minutes** auto-logout for security
- **Concurrent sessions**: **Max 3** active sessions per user
- **Session recovery**: Loading spinner on app init while session restores
- **Custom hook**: `useAuth()` hook exposing `session`, `user`, `role`, `departmentId`, `isLoading`, `signOut()`, `redirectToDashboard(role)`

### 7. Error Handling Strategy (Decided)
- **Auth error boundary**: Yes — wrap app, catch corrupted session, redirect to login
- **Auth state errors**: Handle explicitly — invalid credentials (toast), email not confirmed ("Check email"), rate limited (retry countdown), network error ("Connection issue")
- **Toast notifications**: **Sonner** — lightweight, accessible, works with shadcn/ui
- **RLS empty results**: Show **"No data available for your role"** — don't expose RLS internals
- **Loading states**: **TanStack Query** for all data fetching — global QueryClientProvider, per-query loading/error, built-in retries
- **Retry logic**: TanStack Query defaults (3 retries, exponential backoff)
- **401/403 handling**: 
  - 401 → redirect to `/login?redirect=<current>`
  - 403 → `/access-denied` page showing user's role and attempted access
- **TanStack Query**: Yes, mandatory — server state, caching, deduping, invalidations
- **React Query devtools**: Development only

### 8. Role-Based Routing Implementation (Decided)
- **Route structure**: 
  - `/login` — public
  - `/student` — Student dashboard (and sub-routes)
  - `/faculty` — Faculty dashboard + 3 tabs
  - `/admin` — HOD/Dean shared (Dean sees all depts, HOD sees own — controlled by RLS + UI)
  - `/access-denied` — 403 page
- **Route protection**: **React Router v6** with `<ProtectedRoute role={['student','faculty','admin']}>` wrapper using `useAuth()`
- **Redirect logic**: `useAuth().redirectToDashboard()` called after login success — navigates to `/student`, `/faculty`, or `/admin` based on role
- **Role hierarchy**: Dean ≥ HOD > Faculty > Student. Dean can access `/admin` (all depts). HOD accesses `/admin` (own dept filtered). Faculty cannot access admin routes. Student cannot access faculty/admin.
- **Route guards**: **Client-side only** — RLS is server enforcement (source of truth). Client guards = UX, not security
- **Deep linking**: If Student accesses `/faculty` → redirect to `/student` + toast "Redirected to your dashboard"
- **Navigation**: Role-based sidebar/header — each role sees only their nav items
- **Router**: **React Router v6** — mature, works well with Vite, no need for file-based router complexity

---

## Summary: Phase 1 Scope

### Database Schema (Supabase)
| Table | Key Columns | RLS |
|-------|-------------|-----|
| `academic_years` | id, start_year, end_year, is_active | Public read (authenticated) |
| `departments` | id, name, code, academic_year_id | Public read (authenticated) |
| `faculty` | id, user_id, emp_id, name, email, phone, department_id, academic_year_id | Restricted |
| `subjects` | id, code, name, department_id, academic_year_id | Public read (authenticated) |
| `faculty_subjects` | id, faculty_id, subject_id | Restricted |
| `students` | id, user_id, register_no, name, program, mobile, email, department_id, academic_year_id | Restricted |
| `enrollments` | id, student_id, subject_id, academic_year_id, status | Restricted |

### Auth Roles (stored in `app_metadata`)
- `student` → redirects to `/student`
- `faculty` → redirects to `/faculty`
- `hod` → redirects to `/admin` (department-scoped)
- `dean` → redirects to `/admin` (all departments)

### Key Implementation Files (Planned)
- `src/app/providers/AuthProvider.tsx` — `useAuth()` hook, session management, idle timeout
- `src/app/routes/ProtectedRoute.tsx` — role-based route wrapper
- `src/features/auth/LoginForm.tsx` — email/password, email confirmation handling
- `src/shared/hooks/useSupabase.ts` — typed Supabase client
- `supabase/schema.sql` — full DDL with RLS policies
- `supabase/seed.sql` — initial admin users (HOD/Dean)

---

## Next Steps
1. Scaffold React + Vite + TypeScript project with ESLint/Prettier
2. Create Supabase project, configure Auth settings
3. Run schema.sql + seed.sql in Supabase SQL editor
4. Implement `useSupabase()`, `useAuth()`, `ProtectedRoute`
5. Build login page with email verification flow
6. Implement role-based redirect after login
7. Add idle timeout, concurrent session limit
8. Test RLS policies with different roles
9. Verify session persistence across browser restarts
