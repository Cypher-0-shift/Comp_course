import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/shared/hooks/useSupabase'
import { useAuth } from '@/shared/hooks/useAuth'
import type { FilterOptions, PaginationState } from '@/shared/types'

export interface StudentListRow {
  sno: number
  student_id: string
  student_name: string
  register_no: string
  program: string
  mobile: string | null
  email: string | null
  subject_code: string
  subject_name: string
  department_name: string
  enrolled_subjects?: Array<{ subject_code: string; subject_name: string; status?: string }>
  status: 'enrolled' | 'completed' | 'dropped'
}

interface UseStudentListParams {
  filters: FilterOptions
  search: string
  pagination?: Pick<PaginationState, 'page' | 'pageSize'>
  departmentName?: string | null
}

export function useStudentList({ filters, search, departmentName }: UseStudentListParams) {
  const supabase = useSupabase()
  const { role, empId } = useAuth()

  return useQuery({
    queryKey: ['faculty-student-list', filters, search, departmentName, role, empId],
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      let query = supabase
        .from('student_enrollments')
        .select('*', { count: 'exact' })

      if (role === 'faculty' && empId) {
        const { data: assignments, error: assignError } = await supabase
          .from('faculty_assignments')
          .select('subject_code')
          .eq('emp_id', empId)

        if (assignError) throw assignError

        const subjectCodes = assignments?.map((a) => a.subject_code) || []
        if (subjectCodes.length > 0) {
          query = query.in('subject_code', subjectCodes)
        } else {
          return { rows: [], total: 0 }
        }
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.subject) {
        query = query.or(`subject_code.eq.${filters.subject},subject_name.ilike.%${filters.subject}%`)
      }

      if (filters.program) {
        query = query.eq('program', filters.program)
      }

      const activeDept = filters.department || departmentName
      if (activeDept) {
        query = query.eq('program', activeDept)
      }

      if (search.trim()) {
        const term = `%${search.trim()}%`
        query = query.or(
          `student_name.ilike.${term},register_no.ilike.${term},email_id.ilike.${term},subject_name.ilike.${term},subject_code.ilike.${term}`
        )
      }

      // Fetch all matching rows in single query
      query = query.range(0, 999)

      const { data, error } = await query

      if (error) throw error

      const groupedMap = new Map<string, StudentListRow>()
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
            department_name: row.program,
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

      const rows = Array.from(groupedMap.values()).map((row, idx) => ({
        ...row,
        sno: idx + 1,
      }))

      return { rows, total: rows.length }
    },
    placeholderData: (prev) => prev,
  })
}
