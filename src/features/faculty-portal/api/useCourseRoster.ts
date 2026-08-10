import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/shared/hooks/useSupabase'

export interface RosterStudentItem {
  id: string
  registerNo: string
  name: string
  program: string
  status: 'Registered' | 'Completed' | 'Pending'
  email?: string
}

export function useCourseRoster(courseCode?: string, search: string = '') {
  const supabase = useSupabase()

  return useQuery({
    queryKey: ['course-roster', courseCode, search],
    staleTime: 3 * 60 * 1000,
    enabled: Boolean(courseCode),
    queryFn: async (): Promise<RosterStudentItem[]> => {
      if (!courseCode) return []

      let query = supabase
        .from('student_enrollments')
        .select('*')
        .ilike('subject_code', courseCode)

      if (search.trim()) {
        const q = `%${search.trim()}%`
        query = query.or(`student_name.ilike.${q},register_no.ilike.${q}`)
      }

      const { data, error } = await query
      if (error) throw error

      return (data || []).map((row, idx) => ({
        id: row.student_id || `${row.register_no}-${idx}`,
        registerNo: row.register_no,
        name: row.student_name,
        program: row.program || row.department_name || 'B.Tech CSE',
        status: row.status === 'completed' ? 'Completed' : 'Registered',
        email: row.email,
      }))
    },
  })
}
