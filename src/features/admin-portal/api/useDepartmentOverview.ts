import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/shared/hooks/useSupabase'
import { useAuth } from '@/shared/hooks/useAuth'

export interface DepartmentOverviewRow {
  sno: number
  department_id: string
  department_name: string
  department_code: string
  students_registered: number
}

export function useDepartmentOverview() {
  const supabase = useSupabase()
  const { role, departmentName } = useAuth()

  return useQuery({
    queryKey: ['admin-department-overview', role, departmentName],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      let query = supabase
        .from('departments')
        .select('*')
        .order('sl_no', { ascending: true })

      if (role === 'hod' && departmentName) {
        query = query.ilike('department_name', `%${departmentName}%`)
      }

      const { data: depts, error: deptError } = await query

      if (deptError) throw deptError

      const rows: DepartmentOverviewRow[] = (depts ?? []).map((d, idx) => ({
        sno: d.sl_no ?? idx + 1,
        department_id: d.id,
        department_name: d.department_name,
        department_code: d.department_name.split('-')[0] || d.department_name,
        students_registered: d.students_registered,
      }))

      return rows
    },
  })
}
