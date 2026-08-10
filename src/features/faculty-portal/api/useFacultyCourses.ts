import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/shared/hooks/useSupabase'
import { useAuth } from '@/shared/hooks/useAuth'

export interface FacultyCourseItem {
  id: string
  code: string
  title: string
  department: string
  registeredStudentsCount: number
  totalCapacity: number
  progressPercentage: number
}

export function useFacultyCourses() {
  const supabase = useSupabase()
  const { empId, role } = useAuth()

  return useQuery({
    queryKey: ['faculty-assigned-courses', empId, role],
    staleTime: 3 * 60 * 1000,
    queryFn: async (): Promise<FacultyCourseItem[]> => {
      // Query assigned courses from faculty_assignments
      let query = supabase.from('faculty_assignments').select('*')
      if (role === 'faculty' && empId) {
        query = query.eq('emp_id', empId)
      }

      const { data: assignments, error } = await query
      if (error) throw error

      if (!assignments || assignments.length === 0) {
        return []
      }

      // Fetch registration counts for each subject
      const courseItems: FacultyCourseItem[] = await Promise.all(
        assignments.map(async (row) => {
          const { count } = await supabase
            .from('student_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('subject_code', row.subject_code)

          const registered = count ?? (row.students_registered || 0)
          const capacity = Math.max(registered + 10, 60)

          return {
            id: row.subject_id || row.subject_code,
            code: row.subject_code,
            title: row.subject_name || row.subject_code,
            department: row.department_name || row.department || 'Engineering',
            registeredStudentsCount: registered,
            totalCapacity: capacity,
            progressPercentage: Math.round((registered / capacity) * 100),
          }
        })
      )

      return courseItems
    },
  })
}
