import { useState, useMemo } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, GraduationCap, Users, BookOpen, Building2 } from 'lucide-react'
import { useDepartmentDetail } from '../api/useDepartmentDetail'
import { FacultyAssignmentsTab } from './FacultyAssignmentsTab'
import { StudentEnrollmentTab } from './StudentEnrollmentTab'
import { cn } from '@/shared/utils/cn'

export function DepartmentDetail() {
  const { id: departmentId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('all')

  const { deptMetaQuery, facultyQuery, studentsQuery } = useDepartmentDetail(departmentId ?? null)

  const deptMeta = deptMetaQuery.data
  const rawFacultyRows = facultyQuery.data ?? []
  const rawStudentRows = studentsQuery.data ?? []

  // Extract unique subjects across student and faculty records for this department
  const uniqueSubjects = useMemo(() => {
    const map = new Map<string, string>()
    rawStudentRows.forEach((r) => {
      if (r.subject_code && r.subject_name) {
        map.set(r.subject_code, r.subject_name)
      }
    })
    rawFacultyRows.forEach((r) => {
      if (r.subject_code && r.subject_name) {
        map.set(r.subject_code, r.subject_name)
      }
    })
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }))
  }, [rawStudentRows, rawFacultyRows])

  // Filter student and faculty rows by selected subject dropdown
  const filteredStudentRows = useMemo(() => {
    if (selectedSubjectCode === 'all') return rawStudentRows
    return rawStudentRows.filter((r) => r.subject_code === selectedSubjectCode)
  }, [rawStudentRows, selectedSubjectCode])

  const filteredFacultyRows = useMemo(() => {
    if (selectedSubjectCode === 'all') return rawFacultyRows
    return rawFacultyRows.filter((r) => r.subject_code === selectedSubjectCode)
  }, [rawFacultyRows, selectedSubjectCode])

  const deptTitle = deptMeta?.department_name || 'Department Detail'

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar with Back Navigation & Subject Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            id="admin-dept-back-btn"
            onClick={() => navigate('/admin')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/80 text-slate-400 transition hover:border-violet-500/40 hover:text-violet-300"
            title="Back to Overview"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 ring-1 ring-violet-500/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100">{deptTitle}</h1>
              <p className="text-xs text-slate-400">
                Department Overview • {deptMeta?.department_code || 'DEPT'}
              </p>
            </div>
          </div>
        </div>

        {/* Subject Selection Dropdown Menu */}
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/90 px-3.5 py-2 text-xs">
          <BookOpen className="h-4 w-4 text-violet-400 shrink-0" />
          <label htmlFor="dept-subject-dropdown" className="font-medium text-slate-400">Select Subject:</label>
          <select
            id="dept-subject-dropdown"
            value={selectedSubjectCode}
            onChange={(e) => setSelectedSubjectCode(e.target.value)}
            className="bg-transparent font-semibold text-slate-100 focus:outline-none cursor-pointer max-w-[260px] truncate"
          >
            <option value="all" className="bg-slate-950 text-slate-100">
              All Subjects ({uniqueSubjects.length})
            </option>
            {uniqueSubjects.map((s) => (
              <option key={s.code} value={s.code} className="bg-slate-950 text-slate-100">
                {s.code} – {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs Container - Default Tab 1: Student List, Tab 2: Faculty List */}
      <Tabs.Root defaultValue="students">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <Tabs.List className="flex gap-1.5 rounded-xl border border-slate-800 bg-slate-950/80 p-1">
            <Tabs.Trigger
              value="students"
              id="dept-tab-students"
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all select-none',
                'text-slate-400 hover:text-slate-200',
                'data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-violet-950/50'
              )}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Student List ({filteredStudentRows.length})</span>
            </Tabs.Trigger>

            <Tabs.Trigger
              value="faculty"
              id="dept-tab-faculty"
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all select-none',
                'text-slate-400 hover:text-slate-200',
                'data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-violet-950/50'
              )}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Faculty List ({filteredFacultyRows.length})</span>
            </Tabs.Trigger>
          </Tabs.List>

          {selectedSubjectCode !== 'all' && (
            <button
              onClick={() => setSelectedSubjectCode('all')}
              className="text-xs text-violet-400 hover:underline font-medium"
            >
              Reset subject filter
            </button>
          )}
        </div>

        {/* Tab Content 1: Student List */}
        <Tabs.Content value="students" className="focus:outline-none">
          <StudentEnrollmentTab rows={filteredStudentRows} isLoading={studentsQuery.isLoading} />
        </Tabs.Content>

        {/* Tab Content 2: Faculty List */}
        <Tabs.Content value="faculty" className="focus:outline-none">
          <FacultyAssignmentsTab rows={filteredFacultyRows} isLoading={facultyQuery.isLoading} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
