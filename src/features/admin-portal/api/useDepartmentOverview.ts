import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/shared/hooks/useSupabase'

export interface DepartmentOverviewRow {
  sno: number
  department_id: string
  department_name: string
  department_code: string
  students_registered: number
}

export function useDepartmentOverview() {
  const supabase = useSupabase()

  return useQuery({
    queryKey: ['admin-department-overview'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data: depts, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .order('sl_no', { ascending: true })

      if (deptError) throw deptError

      const rows: DepartmentOverviewRow[] = (depts ?? []).map((d) => ({
        sno: d.sl_no,
        department_id: d.id,
        department_name: d.department_name,
        department_code: d.department_name.split('-')[0] || d.department_name,
        students_registered: d.students_registered,
      }))

      return rows
    },
  })
}
