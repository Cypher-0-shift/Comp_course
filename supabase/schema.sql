-- =============================================
-- COMPENSATORY COURSE DASHBOARD - SUPABASE SCHEMA
-- =============================================
-- This schema implements the database design from CONTEXT.md
-- 7 tables with academic_year FK, RLS policies for 4 roles
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. HELPER FUNCTIONS
-- =============================================

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 2. ACADEMIC YEARS TABLE
-- =============================================
-- Reference table for academic year separation (e.g., 2025-26)
-- Only one active year at a time
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    start_year INTEGER NOT NULL,
    end_year INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    label TEXT GENERATED ALWAYS AS (start_year::TEXT || '-' || SUBSTRING(end_year::TEXT FROM 3 FOR 2)) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique academic year combinations
    CONSTRAINT unique_academic_year UNIQUE (start_year, end_year),
    -- Ensure logical year ordering
    CONSTRAINT valid_year_range CHECK (end_year = start_year + 1)
);

-- Partial unique index: only one active academic year
CREATE UNIQUE INDEX idx_academic_years_active
    ON academic_years (is_active)
    WHERE is_active = TRUE;

-- Trigger for updated_at
CREATE TRIGGER update_academic_years_updated_at
    BEFORE UPDATE ON academic_years
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: Allow all authenticated users to read academic years
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_users_can_read_academic_years"
    ON academic_years FOR SELECT
    TO authenticated
    USING (TRUE);

COMMENT ON TABLE academic_years IS 'Reference table for academic years (e.g., 2025-26). Only one active at a time.';

-- =============================================
-- 3. DEPARTMENTS TABLE
-- =============================================
-- Departments belong to an academic year
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique department code per academic year
    CONSTRAINT unique_dept_code_per_year UNIQUE (code, academic_year_id)
);

-- Indexes
CREATE INDEX idx_departments_academic_year ON departments(academic_year_id);
CREATE INDEX idx_departments_code ON departments(code);

-- Trigger for updated_at
CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: Allow all authenticated users to read departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_users_can_read_departments"
    ON departments FOR SELECT
    TO authenticated
    USING (TRUE);

COMMENT ON TABLE departments IS 'Departments scoped to academic year. All authenticated users can read for reference.';

-- =============================================
-- 4. FACULTY TABLE
-- =============================================
-- Faculty members linked to auth.users via user_id
-- Scoped to department and academic year
CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emp_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_faculty_user_id ON faculty(user_id);
CREATE INDEX idx_faculty_department ON faculty(department_id);
CREATE INDEX idx_faculty_academic_year ON faculty(academic_year_id);
CREATE INDEX idx_faculty_emp_id ON faculty(emp_id);

-- Trigger for updated_at
CREATE TRIGGER update_faculty_updated_at
    BEFORE UPDATE ON faculty
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: Faculty reference data readable by all authenticated users
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_users_can_read_faculty"
    ON faculty FOR SELECT
    TO authenticated
    USING (TRUE);

COMMENT ON TABLE faculty IS 'Faculty members linked to auth.users. Reference data readable by all roles.';

-- =============================================
-- 5. SUBJECTS TABLE
-- =============================================
-- Subjects belong to department and academic year
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique subject code per academic year
    CONSTRAINT unique_subject_code_per_year UNIQUE (code, academic_year_id)
);

-- Indexes
CREATE INDEX idx_subjects_department ON subjects(department_id);
CREATE INDEX idx_subjects_academic_year ON subjects(academic_year_id);
CREATE INDEX idx_subjects_code ON subjects(code);

-- Trigger for updated_at
CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: All authenticated users can read subjects (reference data)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_users_can_read_subjects"
    ON subjects FOR SELECT
    TO authenticated
    USING (TRUE);

COMMENT ON TABLE subjects IS 'Subjects/courses scoped to department and academic year. Reference data for all.';

-- =============================================
-- 6. FACULTY_SUBJECTS JUNCTION TABLE
-- =============================================
-- Many-to-many: faculty can teach multiple subjects, subjects can have multiple faculty
-- Core table for faculty RLS policies
CREATE TABLE faculty_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate assignments
    CONSTRAINT unique_faculty_subject UNIQUE (faculty_id, subject_id)
);

-- Indexes
CREATE INDEX idx_faculty_subjects_faculty ON faculty_subjects(faculty_id);
CREATE INDEX idx_faculty_subjects_subject ON faculty_subjects(subject_id);

-- Trigger for updated_at
CREATE TRIGGER update_faculty_subjects_updated_at
    BEFORE UPDATE ON faculty_subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RLS POLICIES FOR FACULTY_SUBJECTS
-- =============================================

ALTER TABLE faculty_subjects ENABLE ROW LEVEL SECURITY;

-- Faculty: Can see their own subject assignments
-- JOIN faculty ON faculty.id = faculty_subjects.faculty_id WHERE faculty.user_id = auth.uid()
CREATE POLICY "faculty_can_read_own_assignments"
    ON faculty_subjects FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM faculty f
            WHERE f.id = faculty_subjects.faculty_id
            AND f.user_id = auth.uid()
        )
    );

-- HOD: Can see assignments for their department
-- JOIN faculty ON faculty.id = faculty_subjects.faculty_id
-- JOIN subjects ON subjects.id = faculty_subjects.subject_id
-- WHERE subjects.department_id = app_metadata.department_id
CREATE POLICY "hod_can_read_dept_assignments"
    ON faculty_subjects FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'hod'
        AND EXISTS (
            SELECT 1 FROM faculty f
            JOIN subjects s ON s.id = faculty_subjects.subject_id
            WHERE f.id = faculty_subjects.faculty_id
            AND s.department_id = (auth.jwt() -> 'app_metadata' ->> 'department_id')::UUID
        )
    );

-- Dean: Can see all assignments
CREATE POLICY "dean_can_read_all_assignments"
    ON faculty_subjects FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'dean'
    );

COMMENT ON TABLE faculty_subjects IS 'Junction table for faculty-subject assignments. RLS restricts by role.';

-- =============================================
-- 7. STUDENTS TABLE
-- =============================================
-- Students linked to auth.users via user_id
-- Scoped to department and academic year
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    register_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    program TEXT NOT NULL,
    mobile TEXT,
    email TEXT,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_students_academic_year ON students(academic_year_id);
CREATE INDEX idx_students_register_no ON students(register_no);

-- Trigger for updated_at
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RLS POLICIES FOR STUDENTS
-- =============================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Student: Can see only their own record
-- WHERE students.user_id = auth.uid()
CREATE POLICY "student_can_read_own_record"
    ON students FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Faculty: Can see students enrolled in their assigned subjects
-- Via enrollments -> subjects -> faculty_subjects WHERE faculty.user_id = auth.uid()
CREATE POLICY "faculty_can_read_assigned_students"
    ON students FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM enrollments e
            JOIN subjects s ON s.id = e.subject_id
            JOIN faculty_subjects fs ON fs.subject_id = s.id
            JOIN faculty f ON f.id = fs.faculty_id
            WHERE e.student_id = students.id
            AND f.user_id = auth.uid()
            AND e.academic_year_id = students.academic_year_id
        )
    );

-- HOD: Can see students in their department
-- WHERE students.department_id = app_metadata.department_id
CREATE POLICY "hod_can_read_dept_students"
    ON students FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'hod'
        AND department_id = (auth.jwt() -> 'app_metadata' ->> 'department_id')::UUID
    );

-- Dean: Can see all students
CREATE POLICY "dean_can_read_all_students"
    ON students FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'dean'
    );

COMMENT ON TABLE students IS 'Student records linked to auth.users. RLS enforces role-based visibility.';

-- =============================================
-- 8. ENROLLMENTS TABLE
-- =============================================
-- Student enrollments in subjects for an academic year
-- Core table for enrollment RLS policies
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate enrollments per student per subject per year
    CONSTRAINT unique_student_subject_year UNIQUE (student_id, subject_id, academic_year_id)
);

-- Indexes
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_subject ON enrollments(subject_id);
CREATE INDEX idx_enrollments_academic_year ON enrollments(academic_year_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- Trigger for updated_at
CREATE TRIGGER update_enrollments_updated_at
    BEFORE UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RLS POLICIES FOR ENROLLMENTS
-- =============================================

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Student: Can see only their own enrollments
-- WHERE enrollments.student_id = students.id AND students.user_id = auth.uid()
CREATE POLICY "student_can_read_own_enrollments"
    ON enrollments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = enrollments.student_id
            AND s.user_id = auth.uid()
        )
    );

-- Faculty: Can see enrollments for their assigned subjects
-- Via subject -> faculty_subjects WHERE faculty.user_id = auth.uid()
CREATE POLICY "faculty_can_read_assigned_enrollments"
    ON enrollments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM faculty_subjects fs
            JOIN faculty f ON f.id = fs.faculty_id
            WHERE fs.subject_id = enrollments.subject_id
            AND f.user_id = auth.uid()
        )
    );

-- HOD: Can see enrollments for subjects in their department
-- WHERE subject.department_id = app_metadata.department_id
CREATE POLICY "hod_can_read_dept_enrollments"
    ON enrollments FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'hod'
        AND EXISTS (
            SELECT 1 FROM subjects s
            WHERE s.id = enrollments.subject_id
            AND s.department_id = (auth.jwt() -> 'app_metadata' ->> 'department_id')::UUID
        )
    );

-- Dean: Can see all enrollments
CREATE POLICY "dean_can_read_all_enrollments"
    ON enrollments FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'dean'
    );

COMMENT ON TABLE enrollments IS 'Student subject enrollments. RLS enforces: student sees own, faculty sees assigned, HOD sees dept, Dean sees all.';

-- =============================================
-- 9. INITIAL DATA - ACADEMIC YEAR
-- =============================================
-- Insert default active academic year (2025-26)
-- This will be overridden by seed.sql for production setup
INSERT INTO academic_years (start_year, end_year, is_active)
VALUES (2025, 2026, TRUE)
ON CONFLICT (start_year, end_year) DO NOTHING;

-- =============================================
-- SCHEMA COMPLETE
-- =============================================
-- Run seed.sql after this for initial admin users and departments
-- =============================================