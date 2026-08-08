import * as Tabs from '@radix-ui/react-tabs'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, GraduationCap, Users } from 'lucide-react'
import { useDepartmentDetail } from '../api/useDepartmentDetail'
import { FacultyAssignmentsTab } from './FacultyAssignmentsTab'
import { StudentEnrollmentTab } from './StudentEnrollmentTab'
import { cn } from '@/shared/utils/cn'

export function DepartmentDetail() {
  const { id: departmentId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { facultyQuery, studentsQuery } = useDepartmentDetail(departmentId ?? null)

  const facultyRows = facultyQuery.data ?? []
  const studentRows = studentsQuery.data ?? []

  return (
    <div className="flex flex-col gap-4">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button
          id="admin-dept-back-btn"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:border-indigo-400/30 hover:text-indigo-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Department Detail</h1>
          <p className="text-xs text-slate-500">ID: {departmentId}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="faculty">
        <Tabs.List className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 w-fit mb-4">
          {[
            { id: 'faculty', label: 'Faculty Assignments', icon: GraduationCap },
            { id: 'students', label: 'Student Enrollment', icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <Tabs.Trigger
              key={id}
              value={id}
              id={`dept-tab-${id}`}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-all',
                'hover:text-slate-200',
                'data-[state=active]:bg-indigo-600/80 data-[state=active]:text-white data-[state=active]:shadow-lg'
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="faculty" className="focus:outline-none">
          <FacultyAssignmentsTab rows={facultyRows} isLoading={facultyQuery.isLoading} />
        </Tabs.Content>

        <Tabs.Content value="students" className="focus:outline-none">
          <StudentEnrollmentTab rows={studentRows} isLoading={studentsQuery.isLoading} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
