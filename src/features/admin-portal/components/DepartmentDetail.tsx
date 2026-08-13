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
  const rawFacultyRows = useMemo(() => facultyQuery.data ?? [], [facultyQuery.data])
  const rawStudentRows = useMemo(() => studentsQuery.data ?? [], [studentsQuery.data])

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
      <div className="lg-card flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <button
            id="admin-dept-back-btn"
            onClick={() => navigate('/admin')}
            className="lg-btn-ghost flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 cursor-pointer"
            title="Back to Overview"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#001941]/8 text-[#001941] border border-[#001941]/15">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#001941]">{deptTitle}</h1>
              <p className="text-xs text-slate-500">
                Department Overview • {deptMeta?.department_code || 'DEPT'}
              </p>
            </div>
          </div>
        </div>

        {/* Subject Selection Dropdown */}
        <div className="lg-pill-slate flex items-center gap-2.5 px-3.5 py-2 text-xs">
          <BookOpen className="h-4 w-4 text-[#001941] shrink-0" />
          <label htmlFor="dept-subject-dropdown" className="font-medium text-slate-500">Select Subject:</label>
          <select
            id="dept-subject-dropdown"
            value={selectedSubjectCode}
            onChange={(e) => setSelectedSubjectCode(e.target.value)}
            className="bg-transparent font-semibold text-[#001941] focus:outline-none cursor-pointer max-w-[260px] truncate"
          >
            <option value="all" className="bg-white text-slate-900">
              All Subjects ({uniqueSubjects.length})
            </option>
            {uniqueSubjects.map((s) => (
              <option key={s.code} value={s.code} className="bg-white text-slate-900">
                {s.code} – {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs Container */}
      <Tabs.Root defaultValue="students">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-4">
          <Tabs.List className="flex gap-1.5 rounded-xl border border-slate-200/60 bg-white/60 backdrop-blur-sm p-1">
            <Tabs.Trigger
              value="students"
              id="dept-tab-students"
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all select-none',
                'text-slate-600 hover:text-[#001941]',
                'data-[state=active]:bg-[#001941] data-[state=active]:text-white data-[state=active]:shadow-md'
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
                'text-slate-600 hover:text-[#001941]',
                'data-[state=active]:bg-[#001941] data-[state=active]:text-white data-[state=active]:shadow-md'
              )}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Faculty List ({filteredFacultyRows.length})</span>
            </Tabs.Trigger>
          </Tabs.List>

          {selectedSubjectCode !== 'all' && (
            <button
              onClick={() => setSelectedSubjectCode('all')}
              className="text-xs text-[#001941] hover:underline font-semibold"
            >
              Reset subject filter
            </button>
          )}
        </div>

        {/* Tab Content 1: Student List */}
        <Tabs.Content value="students" className="focus:outline-none">
          <div className="lg-table-container">
            <StudentEnrollmentTab rows={filteredStudentRows} isLoading={studentsQuery.isLoading} />
          </div>
        </Tabs.Content>

        {/* Tab Content 2: Faculty List */}
        <Tabs.Content value="faculty" className="focus:outline-none">
          <div className="lg-table-container">
            <FacultyAssignmentsTab rows={filteredFacultyRows} isLoading={facultyQuery.isLoading} />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
