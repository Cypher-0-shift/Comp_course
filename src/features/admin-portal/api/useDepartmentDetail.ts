import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/shared/hooks/useSupabase'

export interface FacultyAssignmentRow {
  sno: number
  faculty_id: string
  faculty_name: string
  emp_id: string
  mobile: string | null
  subject_id: string
  subject_code: string
  subject_name: string
}

export interface DeptStudentRow {
  sno: number
  student_id: string
  student_name: string
  register_no: string
  program: string
  mobile: string | null
  email: string | null
  subject_code: string
  subject_name: string
  status: 'enrolled' | 'completed' | 'dropped'
}

export function useDepartmentDetail(departmentId: string | null) {
  const supabase = useSupabase()

  const facultyQuery = useQuery({
    queryKey: ['admin-dept-faculty', departmentId],
    enabled: !!departmentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faculty_assignments')
        .select('*')

      if (error) throw error

      const rows: FacultyAssignmentRow[] = (data ?? []).map((row, idx) => ({
        sno: row.sno ?? idx + 1,
        faculty_id: row.id,
        faculty_name: row.faculty_name,
        emp_id: row.emp_id,
        mobile: row.mobile_number,
        subject_id: row.id,
        subject_code: row.subject_code,
        subject_name: row.subject_name,
      }))

      return rows
    },
  })

  const studentsQuery = useQuery({
    queryKey: ['admin-dept-students', departmentId],
    enabled: !!departmentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_enrollments')
        .select('*')

      if (error) throw error

      const rows: DeptStudentRow[] = (data ?? []).map((row, idx) => ({
        sno: row.sno ?? idx + 1,
        student_id: row.id,
        student_name: row.student_name,
        register_no: row.register_no,
        program: row.program,
        mobile: row.mobile_no,
        email: row.email_id,
        subject_code: row.subject_code,
        subject_name: row.subject_name,
        status: (row.status as 'enrolled' | 'completed' | 'dropped') || 'enrolled',
      }))

      return rows
    },
  })

  return { facultyQuery, studentsQuery }
}
