# Roadmap: Compensatory Course Dashboard

**Project:** Compensatory Course Dashboard
**Core Value:** Faculty and admins can securely view, filter, and manage compensatory course enrollments with role-based data visibility
**Depth:** quick (3-5 phases)
**Created:** 2026-08-07

## Phases

- [ ] **Phase 1: Foundation & Authentication** - Project setup, Supabase configuration, auth with roles, database schema, and RLS policies
  - [x] **Plan 01-01:** Project Scaffold + Supabase Schema (schema, seed, project setup)
  - [ ] **Plan 01-02:** Supabase Client & Auth Provider (typed client, AuthProvider, useAuth)
  - [ ] **Plan 01-03:** Login Flow & Role-Based Routing (login, protected routes, role redirects)
- [ ] **Phase 2: Student Portal** - Student dashboard with profile, enrolled courses, and faculty contacts
- [ ] **Phase 3: Faculty Portal** - Faculty dashboard with 3 tabs (Student/Faculty/Department lists), filtering, search, pagination, and student detail view
- [ ] **Phase 4: Admin Portal & Data Import** - Admin dashboard with department overview, drill-down tabs, and Excel/CSV upload with validation

## Phase Details

### Phase 1: Foundation & Authentication
**Goal**: Project is scaffolded, Supabase configured, users can authenticate with role-based access, and database enforces data visibility via RLS
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, DAT-01, DAT-02, DAT-04
**Success Criteria** (what must be TRUE):
  1. User can sign up with email/password (invite-only or admin-created)
  2. User can log in and stay logged in across browser sessions
  3. User can log out from any page
  4. User role (Student/Faculty/HOD/Dean) determines which dashboard they access
  5. Database tables exist for students, faculty, subjects, enrollments, departments with academic year support
  6. RLS policies enforce: students see only own enrollments, faculty see only assigned courses, admins see all data
**Plans**: TBD

### Phase 2: Student Portal
**Goal**: Students can view their own profile, enrolled compensatory courses, and assigned faculty contact details
**Depends on**: Phase 1
**Requirements**: STU-01, STU-02, STU-03, STU-04
**Success Criteria** (what must be TRUE):
  1. Student sees their own profile (name, register no, program, mobile, email)
  2. Student sees list of their enrolled compensatory courses with subject code and name
  3. Student sees assigned faculty email and phone for each enrolled subject
  4. Student cannot access other students' data or faculty lists (enforced by RLS + UI)
**Plans**: TBD

### Phase 3: Faculty Portal
**Goal**: Faculty can view and filter student/faculty/department data for their assigned courses with full table interactions
**Depends on**: Phase 1
**Requirements**: FAC-01, FAC-02, FAC-03, FAC-04, FAC-05, FAC-06, FAC-07, FAC-08, FAC-09
**Success Criteria** (what must be TRUE):
  1. Faculty lands on dashboard with 3 navigation tabs: Student List, Faculty List, Department List
  2. Student List table displays: Sno, Student Name, Register No, Program, Mobile, Email, Subject Code, Subject
  3. Faculty List table displays: Sno, Subject Code, Subject Name, Students Registered, Faculty Name, Department, Emp ID, Mobile Number
  4. Department List shows department-wise student enrollment summary
  5. All faculty tables support filter dropdowns (department, program, subject, status)
  6. All faculty tables support global search across visible columns
  7. All faculty tables support pagination for large datasets
  8. Clicking a student row in Student List opens detailed student profile view
  9. Faculty only sees data for their assigned courses/departments (RLS enforced)
**Plans**: TBD

### Phase 4: Admin Portal & Data Import
**Goal**: Admins (HOD/Dean) can oversee department-wide enrollments, drill into faculty assignments and student enrollments, and upload yearly data via Excel/CSV
**Depends on**: Phase 1
**Requirements**: ADM-01, ADM-02, ADM-03, ADM-04, ADM-05, ADM-06, ADM-07, DAT-03
**Success Criteria** (what must be TRUE):
  1. Admin sees department overview: Sl.No, Department Name, Students Registered
  2. Clicking a department navigates to department detail with two tabs: Faculty Assignments and Student Enrollment
  3. Faculty Assignments tab shows which faculty assigned to which subject in that department
  4. Student Enrollment tab shows all students enrolled in that department across subjects
  5. Admin Excel upload page accepts student list, faculty list, department data (CSV/Excel)
  6. Upload validates data, shows errors, confirms imported counts
  7. Admin sees all departments and all data (no RLS restrictions)
  8. Excel/CSV import maps columns to database schema with academic year field
**Plans**: TBD

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Authentication | 1/3 | In Progress | 2026-08-07 |
| 2. Student Portal | 0/2 | Not started | - |
| 3. Faculty Portal | 0/3 | Not started | - |
| 4. Admin Portal & Data Import | 0/3 | Not started | - |