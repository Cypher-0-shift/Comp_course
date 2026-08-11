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

export interface DepartmentMeta {
  id: string
  department_name: string
  department_code: string
  students_registered: number
}

export function useDepartmentDetail(departmentId: string | null) {
  const supabase = useSupabase()

  const deptMetaQuery = useQuery({
    queryKey: ['admin-dept-meta', departmentId],
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!departmentId) return null
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', departmentId)
        .single()

      if (error || !data) return null

      return {
        id: data.id,
        department_name: data.department_name,
        department_code: data.department_name.split('-')[0] || data.department_name,
        students_registered: data.students_registered ?? 0,
      } as DepartmentMeta
    },
  })

  const facultyQuery = useQuery({
    queryKey: ['admin-dept-faculty', departmentId],
    enabled: !!departmentId,
    staleTime: 3 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faculty_assignments')
        .select('*')

      if (error) throw error

      const facultyMap = new Map<string, FacultyAssignmentRow>();
      (data ?? []).forEach((row) => {
        const key = (row.emp_id || row.faculty_name || '').trim().toLowerCase();
        if (!key) return;
        if (!facultyMap.has(key)) {
          facultyMap.set(key, {
            sno: 0,
            faculty_id: row.id,
            faculty_name: row.faculty_name,
            emp_id: row.emp_id || '',
            mobile: row.mobile_number || null,
            subject_id: row.subject_code || '',
            subject_code: row.subject_code || '',
            subject_name: row.subject_name || '',
          });
        }
      });
      return Array.from(facultyMap.values()).map((row, idx) => ({
        ...row,
        sno: idx + 1
      }));
    },
  })

  const studentsQuery = useQuery({
    queryKey: ['admin-dept-students', departmentId],
    enabled: !!departmentId && !!deptMetaQuery.data?.department_name,
    staleTime: 3 * 60 * 1000,
    queryFn: async () => {
      const activeDept = deptMetaQuery.data?.department_name
      if (!activeDept) return []

      const { data, error } = await supabase
        .from('student_enrollments')
        .select('*')
        .ilike('program', `%${activeDept}%`)

      if (error) throw error

      const studentMap = new Map<string, DeptStudentRow>()

      ;(data ?? []).forEach((row) => {
        const key = (row.register_no || row.student_name || '').trim().toLowerCase()
        if (!key) return

        if (!studentMap.has(key)) {
          studentMap.set(key, {
            sno: 0,
            student_id: row.id,
            student_name: row.student_name,
            register_no: row.register_no,
            program: row.program,
            mobile: row.mobile_no,
            email: row.email_id,
            subject_code: row.subject_code || '',
            subject_name: row.subject_name || '',
            status: (row.status as 'enrolled' | 'completed' | 'dropped') || 'enrolled',
          })
        } else {
          const existing = studentMap.get(key)!
          if (row.subject_code) {
            existing.subject_code = existing.subject_code
              ? `${existing.subject_code} | ${row.subject_code}`
              : row.subject_code
            existing.subject_name = existing.subject_name
              ? `${existing.subject_name} | ${row.subject_name || '—'}`
              : row.subject_name || '—'
          }
        }
      })

      return Array.from(studentMap.values()).map((row, idx) => ({
        ...row,
        sno: idx + 1,
      }))
    },
  })

  return { deptMetaQuery, facultyQuery, studentsQuery }
}
