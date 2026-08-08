import { StudentWithRelations, EnrollmentWithRelations } from '@/shared/types'
import { supabase } from '@/shared/hooks/useSupabase'

// Mock Data Fallback for Development
export const MOCK_STUDENT_PROFILE: StudentWithRelations = {
  id: 'stu-123',
  user_id: 'usr-123',
  register_no: '22CS101',
  name: 'Alex Johnson',
  program: 'B.Tech Computer Science',
  mobile: '+1 234-567-8900',
  email: 'alex.j@college.edu',
  department_id: 'dept-cs',
  academic_year_id: 'ay-2026',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  department: {
    id: 'dept-cs',
    name: 'Computer Science and Engineering',
    code: 'CSE',
    academic_year_id: 'ay-2026',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export const MOCK_ENROLLMENTS: EnrollmentWithRelations[] = [
  {
    id: 'enr-1',
    student_id: 'stu-123',
    subject_id: 'sub-1',
    academic_year_id: 'ay-2026',
    status: 'enrolled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subject: {
      id: 'sub-1',
      code: 'CS301',
      name: 'Database Management Systems',
      department_id: 'dept-cs',
      academic_year_id: 'ay-2026',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      faculty_subjects: [
        {
          id: 'fs-1',
          faculty_id: 'fac-1',
          subject_id: 'sub-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          faculty: {
            id: 'fac-1',
            user_id: 'usr-fac1',
            emp_id: 'EMP001',
            name: 'Dr. Sarah Smith',
            email: 'sarah.smith@college.edu',
            phone: '+1 987-654-3210',
            department_id: 'dept-cs',
            academic_year_id: 'ay-2026',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        }
      ]
    }
  },
  {
    id: 'enr-2',
    student_id: 'stu-123',
    subject_id: 'sub-2',
    academic_year_id: 'ay-2026',
    status: 'enrolled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subject: {
      id: 'sub-2',
      code: 'CS305',
      name: 'Computer Networks',
      department_id: 'dept-cs',
      academic_year_id: 'ay-2026',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      faculty_subjects: [
        {
          id: 'fs-2',
          faculty_id: 'fac-2',
          subject_id: 'sub-2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          faculty: {
            id: 'fac-2',
            user_id: 'usr-fac2',
            emp_id: 'EMP002',
            name: 'Prof. Michael Brown',
            email: 'michael.b@college.edu',
            phone: '+1 987-654-3211',
            department_id: 'dept-cs',
            academic_year_id: 'ay-2026',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        }
      ]
    }
  }
]

export async function getStudentProfile(): Promise<StudentWithRelations | null> {
  try {
    const { data: userRes } = await supabase.auth.getUser()
    if (userRes?.user?.email) {
      const { data, error } = await supabase
        .from('student_enrollments')
        .select('*')
        .eq('email_id', userRes.user.email)
        .maybeSingle()

      if (!error && data) {
        return {
          id: data.id,
          user_id: userRes.user.id,
          register_no: data.register_no,
          name: data.student_name,
          program: data.program,
          mobile: data.mobile_no || '',
          email: data.email_id,
          department_id: 'dept-cs',
          academic_year_id: 'ay-2026',
          created_at: data.created_at,
          updated_at: data.updated_at,
          department: {
            id: 'dept-cs',
            name: data.program,
            code: data.program,
            academic_year_id: 'ay-2026',
            created_at: data.created_at,
            updated_at: data.updated_at,
          }
        }
      }
    }
  } catch (e) {
    console.warn('Supabase query failed:', e)
  }
  return null
}

export async function getStudentEnrollments(): Promise<EnrollmentWithRelations[]> {
  try {
    const { data: userRes } = await supabase.auth.getUser()
    if (userRes?.user?.email) {
      const { data, error } = await supabase
        .from('student_enrollments')
        .select('*')
        .eq('email_id', userRes.user.email)

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
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
          }
        }))
      }
    }
  } catch (e) {
    console.warn('Supabase query failed:', e)
  }
  return []
}
