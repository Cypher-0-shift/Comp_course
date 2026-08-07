---
phase: 01-foundation-auth
plan: 01
subsystem: "project-scaffold-supabase-schema"
tags: [scaffold, supabase, schema, rls, authentication-foundation]
requires: []
provides: [DAT-01, DAT-02, DAT-04]
affects: [all-subsequent-phases]
tech_stack:
  added: [react, vite, typescript, @supabase/supabase-js, react-router-dom, @tanstack/react-query, sonner, zod, lucide-react, clsx, tailwind-merge, @radix-ui/*, tailwindcss, eslint, prettier]
  patterns: [feature-based-folder-structure, path-aliases, typed-supabase-placeholders]
key_files:
  created:
    - package.json
    - tsconfig.json
    - tsconfig.node.json
    - vite.config.ts
    - tailwind.config.js
    - postcss.config.js
    - eslint.config.js
    - .prettierrc
    - index.html
    - src/main.tsx
    - src/App.tsx
    - src/vite-env.d.ts
    - src/index.css
    - src/shared/types/index.ts
    - src/app/providers/AuthProvider.tsx
    - src/app/routes/router.tsx
    - supabase/schema.sql
    - supabase/seed.sql
    - .env.example
  modified: []
key_decisions:
  - decision: "Feature-based folder organization (src/features/, src/shared/, src/app/)"
    rationale: "Matches CONTEXT.md decision for clear separation of concerns by role portal"
  - decision: "Supabase schema with 7 tables and academic_year FK on all relevant tables"
    rationale: "Implements CONTEXT.md data model with yearly data separation"
  - decision: "RLS policies for 4 roles (student, faculty, hod, dean) on restricted tables"
    rationale: "Enforces security at database level per CONTEXT.md - students see own, faculty see assigned, HOD sees dept, Dean sees all"
  - decision: "Seed script creates HOD (with department_id) and Dean (without department_id) in auth.users with app_metadata"
    rationale: "Enables role-based routing and RLS policy evaluation immediately after setup"
requirements_completed: [DAT-01, DAT-02, DAT-04]
duration: "45 min"
completed: "2026-08-07T19:35:00Z"
---

# Phase 01 Plan 01: Project Scaffold + Supabase Schema Summary

**Duration:** 45 min | **Tasks:** 3/3 complete | **Files Created:** 20

## What Was Built

### 1. React + Vite + TypeScript Project Scaffold
Complete project initialization with all dependencies and tooling:
- **Runtime deps:** react, react-dom, react-router-dom, @supabase/supabase-js, @tanstack/react-query, sonner, zod, lucide-react, clsx, tailwind-merge, @radix-ui/* (avatar, dialog, dropdown-menu, label, select, separator, slot, tabs, toast, tooltip, scroll-area)
- **Dev deps:** typescript, vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer, eslint, @eslint/js, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, prettier, prettier-plugin-tailwindcss, @types/node
- **TypeScript config:** Strict mode, path aliases (@/ → src/*), ES2020 target, DOM lib
- **Vite config:** React plugin, path alias @ → ./src, process.env define
- **Tailwind config:** shadcn/ui compatible (darkMode: "class"), CSS variables for theming, content paths for src/**
- **ESLint:** Flat config with typescript-eslint, react-hooks, react-refresh
- **Prettier:** Single quotes, trailing comma es5, printWidth 100, tailwind plugin

### 2. Feature-Based Folder Structure (per CONTEXT.md)
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
└── app/
    ├── routes/
    ├── layouts/
    └── providers/
```

### 3. Shared TypeScript Types (src/shared/types/index.ts)
Complete type definitions mirroring the database schema:
- `UserRole`: 'student' | 'faculty' | 'hod' | 'dean'
- `AcademicYear`, `Department`, `Faculty`, `Subject`, `FacultySubject`, `Student`, `Enrollment`
- Extended relation types (e.g., `StudentWithRelations`, `EnrollmentWithRelations`)
- Auth types: `AuthUser`, `Session`
- UI types: `FilterOptions`, `PaginationState`, `TableColumn`

### 4. Supabase Database Schema (supabase/schema.sql - 421 lines)
**7 tables with full DDL:**
1. `academic_years` - reference table with generated label, partial unique index for single active year
2. `departments` - scoped to academic_year, unique code per year
3. `faculty` - linked to auth.users via user_id, scoped to department + academic_year
4. `subjects` - scoped to department + academic_year, unique code per year
5. `faculty_subjects` - junction table (many-to-many), unique faculty-subject pairs
6. `students` - linked to auth.users via user_id, scoped to department + academic_year
7. `enrollments` - student-subject-year with status (enrolled/completed/dropped)

**All tables have:**
- UUID primary keys with uuid_generate_v4()
- Foreign key constraints with ON DELETE RESTRICT/CASCADE
- Indexes on FK columns, academic_year_id, user_id
- `updated_at` trigger via `update_updated_at_column()` function

**RLS Policies (15 total):**
- `academic_years`, `departments`, `faculty`, `subjects`: SELECT for all authenticated users (reference data)
- `faculty_subjects`: 3 policies — Faculty (own via user_id), HOD (dept via app_metadata), Dean (all)
- `students`: 4 policies — Student (own via user_id), Faculty (via enrollments→subjects→faculty_subjects), HOD (dept via app_metadata), Dean (all)
- `enrollments`: 4 policies — Student (own), Faculty (assigned subjects), HOD (dept subjects), Dean (all)

### 5. Seed Data (supabase/seed.sql - 200 lines)
- Active academic year 2025-26
- 4 departments: CSE, ECE, MECH, CIVIL (linked to academic year)
- HOD user: hod@college.edu / password123, role='hod', department_id=<CSE> in app_metadata, email_confirmed_at=NOW()
- Dean user: dean@college.edu / password123, role='dean', department_id=null, email_confirmed_at=NOW()
- Placeholder comments for test faculty/student creation

## Verification Results

| Check | Result |
|-------|--------|
| `npm run typecheck` | ✅ Clean (0 errors) |
| `npm run build` | ✅ Success (224 KB JS, 5.5 KB CSS) |
| `npm run dev` | ✅ Starts in 591ms, no console errors |
| `supabase/schema.sql` | ✅ 7 tables, 15 RLS policies, all FKs, triggers |
| `supabase/seed.sql` | ✅ Academic year, 4 depts, HOD + Dean with app_metadata |

## Requirements Addressed

- **DAT-01**: Supabase tables (students, faculty, subjects, enrollments, departments) ✅
- **DAT-02**: RLS policies (student/faculty/HOD/Dean visibility) ✅
- **DAT-04**: Academic year field on all relevant tables ✅

## Deviations from Plan

None - plan executed exactly as written.

## What This Enables

Plan 01-02 (Supabase Client & Auth Provider) can now:
- Use the typed Database schema from `src/shared/types/index.ts`
- Connect to Supabase with the schema structure defined
- Implement `useAuth()` hook with role/department extraction from `app_metadata`
- Build on the RLS foundation for secure data access

Plan 01-03 (Login Flow & Role-Based Routing) can now:
- Use the seeded HOD/Dean credentials for testing
- Implement role-based redirects matching the 4 UserRole types
- Test RLS enforcement with real authenticated users

---

**Next:** Ready for Plan 01-02: Supabase Client & Auth Provider