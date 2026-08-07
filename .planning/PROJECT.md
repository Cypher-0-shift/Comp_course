# Compensatory Course Dashboard

## What This Is

A secure, role-based web dashboard for managing compensatory course enrollments in a college. Three distinct portals: **Students** view their own enrollment details and faculty contacts; **Faculty** view and filter student/faculty/department lists for their assigned courses; **Admins (HOD/Dean)** oversee department-wide enrollments, faculty assignments, and upload yearly Excel data. Built with React + Supabase for secure, real-time data access with row-level security.

## Core Value

Faculty and admins can securely view, filter, and manage compensatory course enrollments with role-based data visibility — each role sees only what they're authorized to see, backed by Supabase RLS policies.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User authentication with role-based access (Student, Faculty, HOD, Dean)
- [ ] Student portal: view own profile + faculty email/phone for enrolled subjects
- [ ] Faculty portal: landing page with 3 tabs — Student List, Faculty List, Department List
- [ ] Faculty Student List: Sno, Student Name, Register No, Program, Mobile, Email, Subject Code, Subject — with filter dropdowns, global search, pagination
- [ ] Faculty Faculty List: Sno, Subject Code, Subject Name, Students Registered, Faculty Name, Department, Emp ID, Mobile Number
- [ ] Faculty Department List: department-wise student enrollment view
- [ ] Faculty student detail view on click
- [ ] Admin (HOD/Dean) portal: department overview (Sl.No, Department Name, Students Registered)
- [ ] Admin department drill-down: Faculty Assignments tab + Student Enrollment tab
- [ ] Admin Excel upload page for yearly student/faculty/department data imports
- [ ] Supabase Row Level Security enforcing role-based data visibility
- [ ] Responsive design with shadcn/ui + Tailwind

### Out of Scope

- Attendance/progress tracking — not core to enrollment visibility, defer to v2
- Email notifications — adds external service complexity, v2
- Saved filter views — nice-to-have, v2
- Dark/light theme toggle — cosmetic, v2
- Automated cloud sync (Google Drive/OneDrive) — manual upload sufficient for v1
- Real-time collaboration — not needed for read-heavy dashboard

## Context

- College compensatory course system — students enroll in makeup courses
- Data currently in Excel sheets: student list, faculty list, department-wise counts
- Confidential data — requires secure storage and role-based access
- Admins (HOD/Dean) need yearly data upload capability
- No course assignment workflow needed — enrollments are pre-determined

## Constraints

- **Tech Stack**: React + Vite + TypeScript, shadcn/ui + Tailwind, Supabase (PostgreSQL + Auth + RLS)
- **Security**: Row-level security mandatory — students see own data only, faculty see assigned courses, admins see all
- **Data Import**: Admin upload UI for Excel/CSV files (yearly updates)
- **Timeline**: v1 focused on core dashboards and secure data access
- **Deployment**: Vercel/Netlify for frontend, Supabase for backend

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase for backend | Free tier, built-in Auth + RLS, PostgreSQL, Excel import via CSV | ✓ Good |
| React + Vite + shadcn/ui | Modern stack, accessible components, great table support, TypeScript | ✓ Good |
| Supabase Auth (email/password) | Integrated RLS, magic links, email verification, no extra cost | ✓ Good |
| Role-based RLS policies | Enforces security at database level, not just UI | ✓ Good |
| Admin Excel upload UI | Yearly data refresh requirement, self-service for admins | — Pending |
| 3 separate dashboard layouts | Different data needs per role, clear separation of concerns | — Pending |

---

*Last updated: 2026-08-07 after initialization*