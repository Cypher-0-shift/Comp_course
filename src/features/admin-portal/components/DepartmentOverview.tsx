import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDepartmentOverview, type DepartmentOverviewRow } from '../api/useDepartmentOverview'
import { useFacultyList } from '@/features/faculty-dashboard/api/useFacultyList'
import { DataTable, type ColumnDef } from '@/features/faculty-dashboard/components/DataTable'
import { Users, ExternalLink, Building2, BookOpen, TrendingUp, BarChart3, GraduationCap } from 'lucide-react'

const COLUMNS: ColumnDef<DepartmentOverviewRow>[] = [
  { key: 'sno', header: '#', className: 'w-12 text-slate-400 font-mono text-xs' },
  { key: 'department_code', header: 'Code', className: 'font-mono text-xs text-violet-400 font-bold' },
  {
    key: 'department_name',
    header: 'Department Name',
    render: (v) => (
      <span className="font-semibold text-slate-100">{v as string}</span>
    ),
  },
  {
    key: 'students_registered',
    header: 'Students Registered',
    render: (v) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-slate-400" />
        <span className="font-bold text-violet-300">{v as number}</span>
      </div>
    ),
  },
  {
    key: 'department_id',
    header: '',
    className: 'w-10 text-right',
    render: () => (
      <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
    ),
  },
]

export function DepartmentOverview() {
  const navigate = useNavigate()
  const { data: rows = [], isLoading } = useDepartmentOverview()
  const { data: facultyData } = useFacultyList({ filters: {}, search: '' })

  const totalDepartments = rows.length
  const totalFacultyCourses = facultyData?.rows.length ?? 0

  const totalStudents = useMemo(() => {
    return rows.reduce((sum, row) => sum + row.students_registered, 0)
  }, [rows])

  // Chart preparation
  const chartItems = useMemo(() => {
    return rows.map((d) => ({
      name: d.department_code,
      fullName: d.department_name,
      count: d.students_registered,
    }))
  }, [rows])

  const maxStudentCount = useMemo(() => {
    if (chartItems.length === 0) return 1
    return Math.max(...chartItems.map((i) => i.count), 1)
  }, [chartItems])

  return (
    <div className="space-y-6">
      {/* Analytics & Graph Split-Screen Row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Side: Key Analytics Cards */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
              Executive Metrics
            </h2>
            <span className="text-xs text-slate-500 font-medium">Live Institutional Data</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5 flex-1">
            {/* Metric 1: Total Academic Departments */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 transition-all duration-300 hover:border-violet-300/80 hover:shadow-md shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Departments</p>
                  <h3 className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight">{totalDepartments}</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 border border-violet-200/60 transition-transform duration-200 group-hover:scale-110">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-violet-600 font-medium">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Active University Faculties</span>
              </div>
            </div>

            {/* Metric 2: Total Registered Students */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 transition-all duration-300 hover:border-violet-300/80 hover:shadow-md shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled Students</p>
                  <h3 className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight">{totalStudents}</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 transition-transform duration-200 group-hover:scale-110">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700 border border-slate-200">Across {totalDepartments} Depts</span>
                <span>Compensatory Roster</span>
              </div>
            </div>

            {/* Metric 3: Active Faculty Assignments */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 transition-all duration-300 hover:border-violet-300/80 hover:shadow-md shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty Course Assignments</p>
                  <h3 className="mt-1 text-2xl font-extrabold text-violet-600 tracking-tight">{totalFacultyCourses}</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 border border-violet-200/60 transition-transform duration-200 group-hover:scale-110">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-violet-600 font-medium">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Assigned Subjects</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Responsive Department Bar Chart */}
        <div className="lg:col-span-7 flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Analytics</h3>
              <p className="text-xs text-slate-500">Student enrollment distribution per department</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs font-semibold text-violet-600">
              <BarChart3 className="h-4 w-4" />
              <span>Enrollment Distribution</span>
            </div>
          </div>

          <div className="flex-1 pt-4 pb-1 flex flex-col justify-end overflow-hidden min-h-[220px]">
            {chartItems.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400 italic">
                Loading department analytics chart data...
              </div>
            ) : (
              <div className="flex flex-col h-full justify-between overflow-hidden">
                <div className="flex items-end justify-around gap-2 h-36 pt-2 px-1 border-b border-slate-200 overflow-hidden">
                  {chartItems.map((item, idx) => {
                    const heightPercent = Math.max(12, Math.round((item.count / maxStudentCount) * 100))
                    return (
                      <div key={idx} className="group relative flex-1 flex flex-col items-center h-full justify-end max-w-[56px]">
                        <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-30 rounded-md bg-slate-900 border border-slate-700 px-2 py-0.5 text-[10px] text-white shadow-xl whitespace-nowrap">
                          <span className="font-bold text-violet-300">{item.name}:</span> {item.count}
                        </div>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full rounded-t-md bg-gradient-to-t from-violet-800 via-violet-600 to-indigo-400 transition-all duration-300 group-hover:brightness-110 group-hover:shadow-md"
                        />
                        <span className="mt-1.5 text-[10px] font-bold text-slate-500 truncate max-w-full group-hover:text-violet-600">
                          {item.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 px-1 font-medium">
                  <span>0 Registered</span>
                  <span>Peak: {maxStudentCount} Students</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Department Overview Data Directory */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 border border-violet-200/60">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Department Directory</h2>
              <p className="text-xs text-slate-500">Click any department row below to view assigned faculty members and enrolled students</p>
            </div>
          </div>
        </div>

        <DataTable<DepartmentOverviewRow>
          columns={COLUMNS}
          rows={rows}
          isLoading={isLoading}
          rowKey={(r) => r.department_id}
          onRowClick={(r) => navigate(`/admin/departments/${r.department_id}`)}
          emptyMessage="No departments found."
        />
      </section>
    </div>
  )
}
