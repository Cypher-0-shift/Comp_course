import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/shared/hooks/useSupabase'
import { useAuth } from '@/shared/hooks/useAuth'

export interface DepartmentListRow {
  sno: number
  department_id: string
  department_name: string
  department_code: string
  students_registered: number
}

export function useDepartmentList() {
  const supabase = useSupabase()
  const { role, departmentName } = useAuth()

  return useQuery({
    queryKey: ['faculty-department-list', role, departmentName],
    queryFn: async () => {
      let query = supabase
        .from('departments')
        .select('*')
        .order('sl_no', { ascending: true })

      if (role === 'hod' && departmentName) {
        query = query.ilike('department_name', `%${departmentName}%`)
      }

      const { data, error } = await query

      if (error) throw error

      const rows: DepartmentListRow[] = (data ?? []).map((dept, idx) => ({
        sno: dept.sl_no ?? idx + 1,
        department_id: dept.id,
        department_name: dept.department_name,
        department_code: dept.department_name.split('-')[0] || dept.department_name,
        students_registered: dept.students_registered,
      }))

      return rows
    },
  })
}
