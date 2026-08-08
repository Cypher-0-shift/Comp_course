import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/shared/hooks/useSupabase'

export interface StudentDetail {
  id: string
  name: string
  register_no: string
  program: string
  mobile: string | null
  email: string | null
  department_name: string
  enrollments: {
    id: string
    status: 'enrolled' | 'completed' | 'dropped'
    subject_code: string
    subject_name: string
  }[]
}

export function useStudentDetail(studentId: string | null) {
  const supabase = useSupabase()

  return useQuery({
    queryKey: ['faculty-student-detail', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('student_enrollments')
          .select('*')
          .eq('id', studentId!)

        if (error || !data || data.length === 0) throw error || new Error('Not found')

        const first = data[0]
        const enrollments = data.map((e) => ({
          id: e.id,
          status: (e.status as 'enrolled' | 'completed' | 'dropped') || 'enrolled',
          subject_code: e.subject_code,
          subject_name: e.subject_name,
        }))

        const detail: StudentDetail = {
          id: first.id,
          name: first.student_name,
          register_no: first.register_no,
          program: first.program,
          mobile: first.mobile_no,
          email: first.email_id,
          department_name: first.program,
          enrollments,
        }

        return detail
      } catch {
        return null
      }
    },
  })
}
