import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/shared/hooks/useSupabase'

export function useSubjectList() {
  const supabase = useSupabase()

  return useQuery({
    queryKey: ['faculty-subject-list'],
    queryFn: async () => {
      // Fetch distinct subjects from faculty_assignments
      const { data, error } = await supabase
        .from('faculty_assignments')
        .select('subject_code, subject_name')

      if (error) throw error

      const uniqueSubjects = new Map<string, string>()
      ;(data ?? []).forEach((row) => {
        if (row.subject_code) {
          uniqueSubjects.set(row.subject_code, row.subject_name || '')
        }
      })

      return Array.from(uniqueSubjects.entries())
        .map(([code, name]) => ({
          label: `${code} – ${name}`,
          value: code,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    },
  })
}
