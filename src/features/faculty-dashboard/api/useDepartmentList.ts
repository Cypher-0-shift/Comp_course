import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/shared/hooks/useSupabase'

export interface DepartmentListRow {
  sno: number
  department_id: string
  department_name: string
  department_code: string
  students_registered: number
}

export function useDepartmentList() {
  const supabase = useSupabase()

  return useQuery({
    queryKey: ['faculty-department-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('sl_no', { ascending: true })

      if (error) throw error

      const rows: DepartmentListRow[] = (data ?? []).map((dept) => ({
        sno: dept.sl_no,
        department_id: dept.id,
        department_name: dept.department_name,
        department_code: dept.department_name.split('-')[0] || dept.department_name,
        students_registered: dept.students_registered,
      }))

      return rows
    },
  })
}
