import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/shared/hooks/useSupabase'
import { useAuth } from '@/shared/hooks/useAuth'

export interface FacultyProfileData {
  name: string
  emp_id: string
  department: string
  email: string
  mobile: string
}

export function useFacultyProfile() {
  const supabase = useSupabase()
  const { user, empId, departmentName } = useAuth()

  return useQuery({
    queryKey: ['faculty-profile', user?.id, empId],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<FacultyProfileData> => {
      // 1. Try querying faculty_assignments by emp_id
      if (empId) {
        const { data: assignments } = await supabase
          .from('faculty_assignments')
          .select('*')
          .eq('emp_id', empId)
          .limit(1)

        if (assignments && assignments.length > 0) {
          const row = assignments[0]
          return {
            name: row.faculty_name || user?.user_metadata?.full_name || 'Faculty Member',
            emp_id: row.emp_id || empId,
            department: row.department || departmentName || 'Department of Computer Science',
            email: user?.email || `${row.emp_id?.toLowerCase()}@srmist.edu.in`,
            mobile: row.mobile || user?.user_metadata?.mobile || '+91 9876543210',
          }
        }
      }

      // 2. Query faculty table by user_id
      if (user?.id) {
        const { data: facultyRows } = await supabase
          .from('faculty')
          .select('*, departments(name)')
          .eq('user_id', user.id)
          .limit(1)

        if (facultyRows && facultyRows.length > 0) {
          const f = facultyRows[0] as any
          return {
            name: f.name || user?.user_metadata?.full_name || 'Faculty Member',
            emp_id: f.emp_id || empId || 'EMP001',
            department: f.departments?.name || departmentName || 'Academic Department',
            email: f.email || user?.email || '',
            mobile: f.phone || '+91 9876543210',
          }
        }
      }

      // 3. Fallback to auth session metadata
      return {
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Dr. Faculty Member',
        emp_id: empId || 'EMP1001',
        department: departmentName || 'Computer Science & Engineering',
        email: user?.email || 'faculty@srmist.edu.in',
        mobile: user?.user_metadata?.mobile || '+91 9876543210',
      }
    },
  })
}
