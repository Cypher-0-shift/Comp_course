import { StudentWithRelations, EnrollmentWithRelations } from '@/shared/types'
import { supabase } from '@/shared/hooks/useSupabase'

export async function getStudentProfile(): Promise<StudentWithRelations | null> {
  const { data: userRes } = await supabase.auth.getUser()
  if (!userRes?.user?.email) {
    throw new Error('No logged-in user session found.')
  }

  const { data, error } = await supabase
    .from('student_enrollments')
    .select('*')
    .eq('email_id', userRes.user.email)
    .limit(1)

  if (error) {
    console.error('Database query error fetching student profile:', error)
    throw error;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const profile = data[0];

  return {
    id: profile.id,
    user_id: userRes.user.id,
    register_no: profile.register_no,
    name: profile.student_name,
    program: profile.program,
    mobile: profile.mobile_no || '',
    email: profile.email_id,
    department_id: 'dept-cs',
    academic_year_id: 'ay-2026',
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    department: {
      id: 'dept-cs',
      name: profile.program,
      code: profile.program,
      academic_year_id: 'ay-2026',
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    }
  }
}

export async function getStudentEnrollments(): Promise<EnrollmentWithRelations[]> {
  const { data: userRes } = await supabase.auth.getUser()
  if (!userRes?.user?.email) {
    throw new Error('No logged-in user session found.')
  }

  // Get student enrollments
  const { data: enrollmentsData, error } = await supabase
    .from('student_enrollments')
    .select('*')
    .eq('email_id', userRes.user.email)

  if (error) {
    console.error('Database query error fetching student enrollments:', error)
    throw error;
  }

  if (!enrollmentsData || enrollmentsData.length === 0) {
    return [];
  }

  // Filter out any placeholders (e.g. subject_code 'N/A' which is inserted during onboarding if no course was specified)
  const realEnrollments = enrollmentsData.filter(e => e.subject_code && e.subject_code !== 'N/A');

  if (realEnrollments.length === 0) {
    return [];
  }

  // Extract unique subject codes
  const subjectCodes = Array.from(new Set(realEnrollments.map(e => e.subject_code)));

  // Fetch faculty assignments for these subjects to show teachers in the UI
  const { data: facultyData } = await supabase
    .from('faculty_assignments')
    .select('*')
    .in('subject_code', subjectCodes);

  const facultyMap = new Map();
  if (facultyData) {
    facultyData.forEach(f => {
      // Map subject code to faculty details
      facultyMap.set(f.subject_code.toUpperCase(), f);
    });
  }

  return realEnrollments.map((item) => {
    const fac = facultyMap.get(item.subject_code.toUpperCase());
    const faculty_subjects = fac ? [{
      id: fac.id,
      faculty_id: fac.emp_id,
      subject_id: item.subject_code,
      created_at: fac.created_at,
      updated_at: fac.updated_at,
      faculty: {
        id: fac.id,
        user_id: fac.emp_id,
        emp_id: fac.emp_id,
        name: fac.faculty_name,
        email: fac.email_id || '',
        phone: fac.mobile_number || '',
        department_id: fac.department,
        academic_year_id: 'ay-2026',
        created_at: fac.created_at,
        updated_at: fac.updated_at
      }
    }] : [];

    return {
      id: item.id,
      student_id: item.id,
      subject_id: item.subject_code,
      academic_year_id: 'ay-2026',
      status: item.status || 'enrolled',
      created_at: item.created_at,
      updated_at: item.updated_at,
      subject: {
        id: item.subject_code,
        code: item.subject_code,
        name: item.subject_name,
        department_id: 'dept-cs',
        academic_year_id: 'ay-2026',
        created_at: item.created_at,
        updated_at: item.updated_at,
        faculty_subjects
      }
    }
  });
}
