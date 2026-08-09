import { useState, useMemo } from 'react'
import { useStudentList, type StudentListRow } from '../api/useStudentList'
import { useFacultyList } from '../api/useFacultyList'
import { DataTable, type ColumnDef } from './DataTable'
import { SearchInput } from './SearchInput'
import { FilterBar, type FilterBarConfig } from './FilterBar'
import { StudentDetailModal } from './StudentDetailModal'
import { useAuth } from '@/shared/hooks/useAuth'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { FilterOptions } from '@/shared/types'
import { Mail, Phone, BookOpen, GraduationCap, CheckCircle2, AlertCircle, Clock, ExternalLink, Layers, ChevronDown } from 'lucide-react'

const STATUS_BADGE: Record<string, { label: string; style: string; icon: typeof CheckCircle2 }> = {
  enrolled: { label: 'Enrolled', style: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', icon: Clock },
  completed: { label: 'Completed', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle2 },
  dropped: { label: 'Dropped', style: 'bg-red-500/20 text-red-300 border-red-500/30', icon: AlertCircle },
}

const COLUMNS: ColumnDef<StudentListRow>[] = [
  { key: 'sno', header: '#', className: 'w-12 text-slate-500 font-mono text-xs' },
  {
    key: 'student_name',
    header: 'Student Name',
    sortable: true,
    render: (v, r) => (
      <div>
        <p className="font-bold text-slate-100">{v as string}</p>
        <p className="text-[11px] text-slate-400 font-normal">{r.program}</p>
      </div>
    ),
  },
  { key: 'register_no', header: 'Register No', sortable: true, className: 'font-mono text-xs text-indigo-300' },
  { key: 'subject_code', header: 'Subject Code', className: 'font-mono text-xs text-slate-300 font-bold' },
  { key: 'subject_name', header: 'Subject Name', className: 'max-w-[220px] truncate' },
  {
    key: 'status',
    header: 'Status',
    render: (v) => {
      const statusKey = (v as string)?.toLowerCase() ?? 'enrolled'
      const meta = STATUS_BADGE[statusKey] ?? {
        label: statusKey,
        style: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        icon: Clock,
      }
      const Icon = meta.icon
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${meta.style}`}
        >
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
      )
    },
  },
]

export function StudentListTab() {
  const { role, departmentName } = useAuth()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 250)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('all')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  // Fetch all assigned subjects for faculty dropdown
  const { data: facultyData } = useFacultyList({ filters: {}, search: '' })

  // Fetch student dataset scoped to department for HOD/Dean
  const { data, isLoading } = useStudentList({
    filters,
    search: debouncedSearch,
    departmentName: (role === 'hod' || role === 'dean') ? departmentName : null,
  })

  const rawRows = data?.rows
  const allRows = useMemo(() => rawRows ?? [], [rawRows])

  // Extract unique assigned subjects for faculty dropdown
  const assignedSubjects = useMemo(() => {
    const map = new Map<string, { code: string; name: string; count: number }>()
    
    // 1. Pre-fill all assignments from faculty_assignments so we show subjects even with 0 students
    if (facultyData?.rows) {
      facultyData.rows.forEach((r) => {
        if (!map.has(r.subject_code)) {
          map.set(r.subject_code, { code: r.subject_code, name: r.subject_name, count: 0 })
        }
      })
    }

    // 2. Count matching enrolled students
    allRows.forEach((r) => {
      const existing = map.get(r.subject_code)
      if (existing) {
        existing.count += 1
      } else {
        // Fallback for students enrolled in other subjects
        map.set(r.subject_code, { code: r.subject_code, name: r.subject_name, count: 1 })
      }
    })
    
    return Array.from(map.values())
  }, [facultyData?.rows, allRows])

  // Filter rows based on selected subject dropdown selection
  const filteredRows = useMemo(() => {
    if (selectedSubjectCode === 'all') return allRows
    return allRows.filter((r) => r.subject_code === selectedSubjectCode)
  }, [allRows, selectedSubjectCode])

  // Get active subject info banner data
  const activeSubjectInfo = useMemo(() => {
    if (selectedSubjectCode === 'all') return null
    return assignedSubjects.find((s) => s.code === selectedSubjectCode) ?? null
  }, [assignedSubjects, selectedSubjectCode])

  // Filter dropdown options for secondary attributes (program, status)
  const filterOptions = useMemo<FilterBarConfig>(() => {
    const programs = [...new Set(allRows.map((r) => r.program).filter(Boolean))]
    return {
      program: programs.map((p) => ({ value: p, label: p })),
      status: [
        { value: 'enrolled', label: 'Enrolled' },
        { value: 'completed', label: 'Completed' },
        { value: 'dropped', label: 'Dropped' },
      ],
    }
  }, [allRows])

  function handleFilterChange(key: keyof FilterOptions, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }

  function handleResetFilters() {
    setFilters({})
    setSearch('')
    setSelectedSubjectCode('all')
  }

  // Inline Accordion Render Function for Expanded Rows
  function renderExpandedStudentRow(r: StudentListRow) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Student Profile</p>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-100">{r.student_name}</span>
          </div>
          <p className="font-mono text-slate-400">Reg No: {r.register_no}</p>
          <p className="text-slate-400">Program: {r.program}</p>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact & Course</p>
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            <span>{r.email || 'No email registered'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-mono">{r.mobile || 'No phone recorded'}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
            <span>{r.subject_code}: {r.subject_name}</span>
          </div>
        </div>

        <div className="flex flex-col justify-between items-start md:items-end gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quick Actions</p>
            <span className="mt-1 inline-block text-[11px] text-slate-400">Assigned Compensatory Course</span>
          </div>
          <button
            onClick={() => setSelectedStudentId(r.student_id)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-600/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition"
          >
            <span>Full Profile Details</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Subject Selection Dropdown Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Select Assigned Subject</h3>
            <p className="text-xs text-slate-400">Choose a course to filter enrolled student records</p>
          </div>
        </div>

        {/* Subject Dropdown Menu */}
        <div className="relative min-w-[260px]">
          <select
            id="faculty-subject-select"
            value={selectedSubjectCode}
            onChange={(e) => setSelectedSubjectCode(e.target.value)}
            className="w-full appearance-none rounded-xl border border-indigo-500/40 bg-slate-900 px-4 py-2.5 pr-10 text-xs font-semibold text-slate-100 shadow-md transition focus:border-indigo-400 focus:outline-none hover:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Assigned Subjects ({allRows.length} Students)</option>
            {assignedSubjects.map((sub) => (
              <option key={sub.code} value={sub.code}>
                {sub.code} &ndash; {sub.name} ({sub.count} Students)
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-indigo-400" />
        </div>
      </div>

      {/* Selected Subject Banner Info (If a specific subject is selected) */}
      {activeSubjectInfo && (
        <div className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-950/40 px-4 py-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-indigo-600 px-2.5 py-1 font-mono font-bold text-white shadow-sm">
              {activeSubjectInfo.code}
            </span>
            <div>
              <p className="font-bold text-slate-100 text-sm">{activeSubjectInfo.name}</p>
              <p className="text-slate-400 text-[11px]">Filtered view for this course</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 font-bold text-indigo-300">
              <Layers className="h-3.5 w-3.5" />
              {filteredRows.length} Enrolled Students
            </span>
            <button
              onClick={() => setSelectedSubjectCode('all')}
              className="text-xs text-slate-400 hover:text-slate-200 underline ml-2"
            >
              Clear Subject Filter
            </button>
          </div>
        </div>
      )}

      {/* Toolbar: Search & Secondary Filters */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <SearchInput
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Search student name, reg no, subject..."
          className="w-full sm:w-80"
        />
        <FilterBar
          filters={filters}
          options={filterOptions}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Main Table with Inline Accordion Expandable Rows & Enlarged Viewport Height */}
      <DataTable<StudentListRow>
        columns={COLUMNS}
        rows={filteredRows}
        isLoading={isLoading}
        rowKey={(r) => `${r.student_id}-${r.subject_code}`}
        renderExpandedRow={renderExpandedStudentRow}
        emptyMessage="No enrolled student records found matching the selected subject or search criteria."
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        studentId={selectedStudentId}
        open={!!selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
      />
    </div>
  )
}
