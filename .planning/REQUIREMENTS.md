# Requirements: Compensatory Course Dashboard

**Defined:** 2026-08-07
**Core Value:** Faculty and admins can securely view, filter, and manage compensatory course enrollments with role-based data visibility

## v1 Requirements

### Authentication (AUTH)

- [ ] **AUTH-01**: User can sign up with email and password (invite-only or admin-created)
- [ ] **AUTH-02**: User can log in and stay logged in across sessions
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: User role (Student/Faculty/HOD/Dean) determines dashboard access
- [ ] **AUTH-05**: Row-level security policies enforce data visibility per role

### Student Portal (STU)

- [ ] **STU-01**: Student sees their own profile (name, register no, program, mobile, email)
- [ ] **STU-02**: Student sees list of their enrolled compensatory courses with subject code/name
- [ ] **STU-03**: Student sees assigned faculty email and phone for each enrolled subject
- [ ] **STU-04**: Student cannot view other students' data or faculty lists

### Faculty Portal (FAC)

- [ ] **FAC-01**: Faculty lands on dashboard with 3 navigation tabs: Student List, Faculty List, Department List
- [ ] **FAC-02**: Student List table shows: Sno, Student Name, Register No, Program, Mobile, Email, Subject Code, Subject
- [ ] **FAC-03**: Faculty List table shows: Sno, Subject Code, Subject Name, Students Registered, Faculty Name, Department, Emp ID, Mobile Number
- [ ] **FAC-04**: Department List shows department-wise student enrollment summary
- [ ] **FAC-05**: All faculty tables support filter dropdowns (department, program, subject, status)
- [ ] **FAC-06**: All faculty tables support global search across visible columns
- [ ] **FAC-07**: All faculty tables support pagination for large datasets
- [ ] **FAC-08**: Click student row in Student List → opens detailed student profile view
- [ ] **FAC-09**: Faculty only sees data for their assigned courses/departments (RLS)

### Admin Portal (ADM) — HOD/Dean

- [ ] **ADM-01**: Admin sees department overview: Sl.No, Department Name, Students Registered
- [ ] **ADM-02**: Click department → navigates to department detail with two tabs
- [ ] **ADM-03**: Faculty Assignments tab: shows which faculty assigned to which subject in that department
- [ ] **ADM-04**: Student Enrollment tab: shows all students enrolled in that department across subjects
- [ ] **ADM-05**: Admin Excel upload page: upload student list, faculty list, department data (CSV/Excel)
- [ ] **ADM-06**: Upload validates data, shows errors, confirms imported counts
- [ ] **ADM-07**: Admin sees all departments and all data (no RLS restrictions)

### Data Management (DAT)

- [ ] **DAT-01**: Supabase tables: students, faculty, subjects, enrollments, departments
- [ ] **DAT-02**: RLS policies: student sees own enrollments, faculty sees assigned courses, admin sees all
- [ ] **DAT-03**: Excel/CSV import maps columns to database schema
- [ ] **DAT-04**: Academic year field to support yearly data separation

## v2 Requirements

### Notifications (NOTF)

- **NOTF-01**: Email notifications for enrollment updates
- **NOTF-02**: Deadline reminders for compensatory course completion

### Tracking (TRCK)

- **TRCK-01**: Faculty marks attendance per student per subject
- **TRCK-02**: Progress tracking (completed/in-progress/pending) per enrollment

### Enhanced UX (ENH)

- **ENH-01**: Saved filter views (named presets)
- **ENH-02**: Dark/light theme toggle
- **ENH-03**: Export filtered tables to Excel/CSV

### Automation (AUTO)

- **AUTO-01**: Scheduled sync from Google Drive/OneDrive to Supabase

## Out of Scope

| Feature | Reason |
|---------|--------|
| Course assignment workflow | Enrollments pre-determined, no assignment needed |
| Real-time collaboration | Read-heavy dashboard, not collaborative editing |
| Mobile app | Web-first, mobile later |
| SSO / OAuth | Email/password sufficient for v1 |
| Audit logging | Not required for v1 compliance |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| STU-01 | Phase 2 | Pending |
| STU-02 | Phase 2 | Pending |
| STU-03 | Phase 2 | Pending |
| STU-04 | Phase 2 | Pending |
| FAC-01 | Phase 3 | Pending |
| FAC-02 | Phase 3 | Pending |
| FAC-03 | Phase 3 | Pending |
| FAC-04 | Phase 3 | Pending |
| FAC-05 | Phase 3 | Pending |
| FAC-06 | Phase 3 | Pending |
| FAC-07 | Phase 3 | Pending |
| FAC-08 | Phase 3 | Pending |
| FAC-09 | Phase 3 | Pending |
| ADM-01 | Phase 4 | Pending |
| ADM-02 | Phase 4 | Pending |
| ADM-03 | Phase 4 | Pending |
| ADM-04 | Phase 4 | Pending |
| ADM-05 | Phase 4 | Pending |
| ADM-06 | Phase 4 | Pending |
| ADM-07 | Phase 4 | Pending |
| DAT-01 | Phase 1 | Pending |
| DAT-02 | Phase 1 | Pending |
| DAT-03 | Phase 4 | Pending |
| DAT-04 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0 ✓

---

*Requirements defined: 2026-08-07*
*Last updated: 2026-08-07 after roadmap creation*