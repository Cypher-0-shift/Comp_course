import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/shared/hooks/useSupabase'
import { useAuth } from '@/shared/hooks/useAuth'
import type { FilterOptions, PaginationState } from '@/shared/types'

export interface FacultyListRow {
  sno: number
  subject_id: string
  subject_code: string
  subject_name: string
  students_registered: number
  faculty_name: string
  department_name: string
  emp_id: string
  mobile: string | null
}

interface UseFacultyListParams {
  filters: FilterOptions
  search: string
  pagination?: Pick<PaginationState, 'page' | 'pageSize'>
}

export function useFacultyList({ filters, search }: UseFacultyListParams) {
  const supabase = useSupabase()
  const { role, empId } = useAuth()

  return useQuery({
    queryKey: ['faculty-list', filters, search, role, empId],
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      let query = supabase
        .from('faculty_assignments')
        .select('*', { count: 'exact' })

      if (role === 'faculty' && empId) {
        query = query.eq('emp_id', empId)
      }

      if (filters.department) {
        query = query.ilike('department', `%${filters.department}%`)
      }

      if (filters.subject) {
        query = query.or(`subject_code.eq.${filters.subject},subject_name.ilike.%${filters.subject}%`)
      }

      if (search.trim()) {
        const term = `%${search.trim()}%`
        query = query.or(
          `faculty_name.ilike.${term},emp_id.ilike.${term},subject_name.ilike.${term},subject_code.ilike.${term},department.ilike.${term}`
        )
      }

      // Fetch all matching rows in single query
      query = query.range(0, 999)

      const { data, error, count } = await query

      if (error) throw error

      const rows: FacultyListRow[] = (data ?? []).map((row, idx) => ({
        sno: row.sno ?? idx + 1,
        subject_id: row.id,
        subject_code: row.subject_code,
        subject_name: row.subject_name,
        students_registered: row.students_registered ?? 0,
        faculty_name: row.faculty_name,
        department_name: row.department,
        emp_id: row.emp_id,
        mobile: row.mobile_number,
      }))

      return { rows, total: count ?? 0 }
    },
    placeholderData: (prev) => prev,
  })
}
