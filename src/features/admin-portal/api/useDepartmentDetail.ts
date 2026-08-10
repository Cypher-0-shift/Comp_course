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

      const facultyMap = new Map<string, FacultyAssignmentRow>()
      ;(data ?? []).forEach((row) => {
        const key = (row.emp_id || row.faculty_name || '').trim().toLowerCase()
        if (!key) return
        if (!facultyMap.has(key)) {
          facultyMap.set(key, {
            sno: 0,
            faculty_id: row.id,
            faculty_name: row.faculty_name,
      }))
    },
  })

  return { deptMetaQuery, facultyQuery, studentsQuery }
}
