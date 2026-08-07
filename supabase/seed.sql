-- =============================================
-- COMPENSATORY COURSE DASHBOARD - SEED DATA
-- =============================================
-- Run this AFTER schema.sql in Supabase SQL Editor
-- Creates: 1 active academic year, 4 departments, HOD and Dean users
-- =============================================

-- =============================================
-- 1. ACADEMIC YEAR (2025-26)
-- =============================================
INSERT INTO academic_years (id, start_year, end_year, is_active)
VALUES (
    uuid_generate_v4(),
    2025,
    2026,
    TRUE
)
ON CONFLICT (start_year, end_year) DO UPDATE SET is_active = TRUE
RETURNING id;

-- Store the academic year ID for use in subsequent inserts
-- We'll use a CTE to get the active academic year ID
WITH active_year AS (
    SELECT id FROM academic_years WHERE is_active = TRUE LIMIT 1
),

-- =============================================
-- 2. DEPARTMENTS
-- =============================================
dept_insert AS (
    INSERT INTO departments (id, name, code, academic_year_id)
    SELECT
        uuid_generate_v4(),
        d.name,
        d.code,
        ay.id
    FROM active_year ay
    CROSS JOIN (VALUES
        ('Computer Science & Engineering', 'CSE'),
        ('Electronics & Communication Engineering', 'ECE'),
        ('Mechanical Engineering', 'MECH'),
        ('Civil Engineering', 'CIVIL')
    ) AS d(name, code)
    ON CONFLICT (code, academic_year_id) DO NOTHING
    RETURNING id, code
),

-- =============================================
-- 3. GET CSE DEPARTMENT ID FOR HOD
-- =============================================
cse_dept AS (
    SELECT id FROM departments WHERE code = 'CSE' AND academic_year_id = (SELECT id FROM active_year) LIMIT 1
),

-- =============================================
-- 4. ADMIN USERS (HOD + DEAN)
-- =============================================
-- Password for both: password123 (bcrypt hash)
-- Using crypt() with blowfish for password hashing
hod_user AS (
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change_token_new,
        recovery_token
    )
    SELECT
        uuid_generate_v4(),
        '00000000-0000-0000-0000-000000000000',
        'hod@college.edu',
        crypt('password123', gen_salt('bf')),
        NOW(), -- Email confirmed immediately for seed user
        jsonb_build_object(
            'provider', 'email',
            'providers', ARRAY['email'],
            'role', 'hod',
            'department_id', cd.id
        ),
        '{}',
        NOW(),
        NOW(),
        '',
        '',
        ''
    FROM cse_dept cd
    ON CONFLICT (email) DO NOTHING
    RETURNING id
),

dean_user AS (
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change_token_new,
        recovery_token
    )
    SELECT
        uuid_generate_v4(),
        '00000000-0000-0000-0000-000000000000',
        'dean@college.edu',
        crypt('password123', gen_salt('bf')),
        NOW(), -- Email confirmed immediately for seed user
        jsonb_build_object(
            'provider', 'email',
            'providers', ARRAY['email'],
            'role', 'dean',
            'department_id', NULL
        ),
        '{}',
        NOW(),
        NOW(),
        '',
        '',
        ''
    ON CONFLICT (email) DO NOTHING
    RETURNING id
)

-- =============================================
-- 5. OPTIONAL: SAMPLE FACULTY AND STUDENT FOR TESTING
-- =============================================
-- These are linked to the admin users above for quick testing
-- In production, these would be created separately

-- Get the CSE department ID again
-- Get HOD user ID
-- Get active academic year ID
-- Note: Faculty/student creation requires auth.users records first
-- For testing, you can create them via the Supabase Auth UI or API

-- For reference, here's what the faculty/student records would look like:
-- (Run manually after creating auth users for faculty/student)

/*
-- Sample Faculty (requires auth user first)
INSERT INTO faculty (id, user_id, emp_id, name, email, phone, department_id, academic_year_id)
VALUES (
    uuid_generate_v4(),
    '<FACULTY_AUTH_USER_ID>',
    'EMP001',
    'Dr. Sample Faculty',
    'faculty@college.edu',
    '9876543210',
    (SELECT id FROM departments WHERE code = 'CSE' AND academic_year_id = (SELECT id FROM academic_years WHERE is_active = TRUE) LIMIT 1),
    (SELECT id FROM academic_years WHERE is_active = TRUE LIMIT 1)
);

-- Sample Student (requires auth user first)
INSERT INTO students (id, user_id, register_no, name, program, mobile, email, department_id, academic_year_id)
VALUES (
    uuid_generate_v4(),
    '<STUDENT_AUTH_USER_ID>',
    'REG2025001',
    'Sample Student',
    'B.Tech CSE',
    '9876543211',
    'student@college.edu',
    (SELECT id FROM departments WHERE code = 'CSE' AND academic_year_id = (SELECT id FROM academic_years WHERE is_active = TRUE) LIMIT 1),
    (SELECT id FROM academic_years WHERE is_active = TRUE LIMIT 1)
);
*/

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify seed data was created correctly:

-- SELECT * FROM academic_years WHERE is_active = TRUE;
-- SELECT * FROM departments WHERE academic_year_id = (SELECT id FROM academic_years WHERE is_active = TRUE);
-- SELECT email, raw_app_meta_data FROM auth.users WHERE email IN ('hod@college.edu', 'dean@college.edu');

-- =============================================
-- LOGIN CREDENTIALS FOR TESTING
-- =============================================
-- HOD: hod@college.edu / password123
-- Dean: dean@college.edu / password123
-- Both have email_confirmed_at = NOW() so no email verification needed
-- =============================================