import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/shared/hooks/useSupabase'
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
  status: 'enrolled' | 'completed' | 'dropped'
}

interface UseStudentListParams {
  filters: FilterOptions
  search: string
  pagination?: Pick<PaginationState, 'page' | 'pageSize'>
}

export function useStudentList({ filters, search }: UseStudentListParams) {
  const supabase = useSupabase()

  return useQuery({
    queryKey: ['faculty-student-list', filters, search],
    queryFn: async () => {
      let query = supabase
        .from('student_enrollments')
        .select('*', { count: 'exact' })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.subject) {
        query = query.or(`subject_code.eq.${filters.subject},subject_name.ilike.%${filters.subject}%`)
      }

      if (filters.program) {
        query = query.eq('program', filters.program)
      }

      if (filters.department) {
        query = query.or(`program.ilike.%${filters.department}%`)
      }

      if (search.trim()) {
        const term = `%${search.trim()}%`
        query = query.or(
          `student_name.ilike.${term},register_no.ilike.${term},email_id.ilike.${term},subject_name.ilike.${term},subject_code.ilike.${term}`
        )
      }

      // Fetch all matching rows in single query
      query = query.range(0, 999)

      const { data, error, count } = await query

      if (error) throw error

      const rows: StudentListRow[] = (data ?? []).map((row, idx) => ({
        sno: row.sno ?? idx + 1,
        student_id: row.id,
        student_name: row.student_name,
        register_no: row.register_no,
        program: row.program,
        mobile: row.mobile_no,
        email: row.email_id,
        subject_code: row.subject_code,
        subject_name: row.subject_name,
        department_name: row.program,
        status: (row.status as 'enrolled' | 'completed' | 'dropped') || 'enrolled',
      }))

      return { rows, total: count ?? 0 }
    },
    placeholderData: (prev) => prev,
  })
}
