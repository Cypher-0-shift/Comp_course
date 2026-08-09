import { BookOpen, Users, UserCheck, TrendingUp, BarChart3 } from 'lucide-react'
import { useDepartmentList } from '../api/useDepartmentList'
import { useFacultyList } from '../api/useFacultyList'
import { useStudentList } from '../api/useStudentList'

export function AnalyticsChartsSection() {
  const { data: deptRows = [] } = useDepartmentList()
  const { data: facultyData } = useFacultyList({ filters: {}, search: '' })
  const { data: studentData } = useStudentList({ filters: {}, search: '' })

  const totalDepartments = deptRows.length
  const uniqueSubjectsCount = new Set(facultyData?.rows.map(r => r.subject_code)).size
  const totalCourses = uniqueSubjectsCount
  const totalStudents = studentData?.rows.length ?? 0

  // Calculate total students handled by assigned courses (students enrolled in faculty's active courses)
  const studentsHandledCount = studentData?.rows.reduce((acc, row) => {
    return row.status === 'enrolled' ? acc + 1 : acc
  }, 0) ?? totalStudents

  // Prepare chart dataset based on department rows
  const chartItems = deptRows.map((d) => ({
    name: d.department_code,
    fullName: d.department_name,
    count: d.students_registered,
  }))

  const maxStudentCount = Math.max(...chartItems.map((i) => i.count), 1)

  // Get unique assigned subjects list for display
  const uniqueFacultySubjects = (() => {
    if (!facultyData?.rows) return []
    const map = new Map<string, { code: string; name: string; dept: string; students: number }>()
    facultyData.rows.forEach((r) => {
      if (!map.has(r.subject_code)) {
        map.set(r.subject_code, {
          code: r.subject_code,
          name: r.subject_name,
          dept: r.department_name,
          students: r.students_registered,
        })
      }
    })
    return Array.from(map.values())
  })()

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 mb-6">
      {/* Left Side: 3 Key Metric Analytics Cards (Grid 5/12 on LG) */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            Key Performance Metrics
          </h2>
          <span className="text-xs text-slate-500 font-medium">Live System Stats</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5 flex-1">
          {/* Metric 1: Total Courses Registered */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 transition-all duration-300 hover:border-indigo-300/80 hover:shadow-md shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Courses Registered</p>
                <h3 className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight">{totalCourses}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 transition-transform duration-200 group-hover:scale-110">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-600 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Active Compensatory Subjects</span>
            </div>
          </div>

          {/* Metric 2: Total Students Enrolled in System */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 transition-all duration-300 hover:border-indigo-300/80 hover:shadow-md shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students Enrolled</p>
                <h3 className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight">{totalStudents}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 transition-transform duration-200 group-hover:scale-110">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700 border border-slate-200">{totalDepartments} Depts</span>
              <span>Overall Enrollment</span>
            </div>
          </div>

          {/* Metric 3: Students Handled by Current Faculty */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 transition-all duration-300 hover:border-indigo-300/80 hover:shadow-md shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Students Handled by You</p>
                <h3 className="mt-1 text-2xl font-extrabold text-indigo-600 tracking-tight">{studentsHandledCount}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 transition-transform duration-200 group-hover:scale-110">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-indigo-600 font-medium">
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700 border border-indigo-200">Active Roster</span>
              <span>Assigned Subjects Students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Department Analytics Chart (7/12 on LG) */}
      <div className="lg:col-span-7 flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 shadow-sm">
        {/* Chart Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Department Analytics</h3>
            <p className="text-xs text-slate-500">Student enrollment distribution across departments</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            <BarChart3 className="h-4 w-4" />
            <span>Department Enrollment</span>
          </div>
        </div>

        {/* Bar Chart Visualization - Contained Container */}
        <div className="flex-1 pt-4 pb-1 flex flex-col justify-end overflow-hidden min-h-[220px]">
          {chartItems.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-400 italic">
              Loading department analytics data...
            </div>
          ) : (
            <div className="flex flex-col h-full justify-between overflow-hidden">
              <div className="flex items-end justify-around gap-2 h-36 pt-2 px-1 border-b border-slate-200 overflow-hidden">
                {chartItems.map((item, idx) => {
                  const heightPercent = Math.max(12, Math.round((item.count / maxStudentCount) * 100))
                  return (
                    <div key={idx} className="group relative flex-1 flex flex-col items-center h-full justify-end max-w-[56px]">
                      {/* Hover Tooltip */}
                      <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-30 rounded-md bg-slate-900 border border-slate-700 px-2 py-0.5 text-[10px] text-white shadow-xl whitespace-nowrap">
                        <span className="font-bold text-indigo-300">{item.name}:</span> {item.count}
                      </div>

                      {/* Bar Fill */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full rounded-t-md bg-gradient-to-t from-indigo-800 via-indigo-600 to-indigo-400 transition-all duration-300 group-hover:brightness-110 group-hover:shadow-md"
                      />
                      <span className="mt-1.5 text-[10px] font-bold text-slate-500 truncate max-w-full group-hover:text-indigo-600">
                        {item.name}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 px-1 font-medium">
                <span>0 Students</span>
                <span>Max Peak: {maxStudentCount} Students</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assigned Subjects Card */}
      <div className="lg:col-span-12 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/60">
            <BookOpen className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Your Assigned Subjects</h3>
            <p className="text-xs text-slate-500">Compensatory courses mapped to your profile</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {uniqueFacultySubjects.map((sub, idx) => (
            <div key={idx} className="flex flex-col justify-between p-4 rounded-xl border border-slate-200/60 bg-slate-50/50 hover:bg-slate-50 transition shadow-2xs">
              <div>
                <span className="inline-block text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md mb-2">
                  {sub.code}
                </span>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{sub.name}</h4>
                <p className="text-[10px] text-slate-500 mt-1">{sub.dept}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200/40 flex items-center justify-between text-[11px] text-slate-600">
                <span>Enrolled Students:</span>
                <span className="font-bold text-indigo-600 bg-indigo-50/80 border border-indigo-100 px-1.5 py-0.5 rounded-md">{sub.students}</span>
              </div>
            </div>
          ))}
          {uniqueFacultySubjects.length === 0 && (
            <div className="col-span-full py-6 text-center text-xs text-slate-400 italic">
              No assigned subjects found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
