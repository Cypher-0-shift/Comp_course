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

export interface EnrolledSubject {
  subject_code: string
  subject_name: string
  status?: string
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
  enrolled_subjects?: EnrolledSubject[]
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
      if (!departmentId) return []

      // Execute server-side RPC for department-filtered faculty assignments
      const { data: rpcData, error: rpcError } = await (supabase.rpc as any)('get_department_faculty', {
        p_department_id: departmentId,
      })

      if (!rpcError && Array.isArray(rpcData)) {
        return rpcData.map((row: any, idx: number) => ({
          sno: Number(row.sno) || idx + 1,
          faculty_id: row.faculty_id,
          faculty_name: row.faculty_name,
          emp_id: row.emp_id,
          mobile: row.mobile,
          subject_id: row.subject_id,
          subject_code: row.subject_code,
          subject_name: row.subject_name,
        })) as FacultyAssignmentRow[]
      }

      // Fallback query
      const { data: dept } = await supabase
        .from('departments')
        .select('department_name')
        .eq('id', departmentId)
        .single()

      let query = supabase.from('faculty_assignments').select('*')
      if (dept?.department_name) {
        const deptCode = dept.department_name.split('-')[0] || dept.department_name
        query = query.or(`department.ilike.%${dept.department_name}%,department.ilike.%${deptCode}%`)
      }

      const { data, error } = await query
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
    staleTime: 3 * 60 * 1000,
    queryFn: async () => {
      if (!departmentId) return []

      // Execute server-side RPC for deduplicated, course-aggregated department students
      const { data: rpcData, error: rpcError } = await (supabase.rpc as any)('get_department_students', {
        p_department_id: departmentId,
      })

      if (!rpcError && Array.isArray(rpcData)) {
        return rpcData.map((row: any, idx: number) => ({
          sno: Number(row.sno) || idx + 1,
          student_id: row.student_id,
          student_name: row.student_name,
          register_no: row.register_no,
          program: row.program,
          mobile: row.mobile,
          email: row.email,
          subject_code: row.subject_code,
          subject_name: row.subject_name,
          enrolled_subjects: Array.isArray(row.enrolled_subjects) ? row.enrolled_subjects : [],
          status: (row.status as 'enrolled' | 'completed' | 'dropped') || 'enrolled',
        })) as DeptStudentRow[]
      }

      // Fallback query if RPC is not registered
      const { data: dept } = await supabase
        .from('departments')
        .select('department_name')
        .eq('id', departmentId)
        .single()

      let query = supabase.from('student_enrollments').select('*')
      if (dept?.department_name) {
        query = query.eq('program', dept.department_name)
      }

      const { data, error } = await query
      if (error) throw error

      // Server fallback register_no deduplication
      const groupedMap = new Map<string, DeptStudentRow>()
      ;(data ?? []).forEach((row) => {
        const regNo = row.register_no?.trim() || row.id
        if (!groupedMap.has(regNo)) {
          groupedMap.set(regNo, {
            sno: 0,
            student_id: row.id,
            student_name: row.student_name,
            register_no: row.register_no,
            program: row.program,
            mobile: row.mobile_no,
            email: row.email_id,
            subject_code: row.subject_code,
            subject_name: row.subject_name,
            enrolled_subjects: [
              {
                subject_code: row.subject_code,
                subject_name: row.subject_name,
                status: row.status,
              },
            ],
            status: (row.status as 'enrolled' | 'completed' | 'dropped') || 'enrolled',
          })
        } else {
          const existing = groupedMap.get(regNo)!
          const subExists = existing.enrolled_subjects?.some((s) => s.subject_code === row.subject_code)
          if (!subExists) {
            existing.enrolled_subjects?.push({
              subject_code: row.subject_code,
              subject_name: row.subject_name,
              status: row.status,
            })
            existing.subject_code += `, ${row.subject_code}`
            existing.subject_name += `, ${row.subject_name}`
          }
        }
      })

      return Array.from(groupedMap.values()).map((row, idx) => ({
        ...row,
        sno: idx + 1,
      }))
    },
  })

  return { deptMetaQuery, facultyQuery, studentsQuery }
}

