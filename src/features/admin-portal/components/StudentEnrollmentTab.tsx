import { useState, useMemo } from 'react'
import { DataTable, type ColumnDef } from '@/features/faculty-dashboard/components/DataTable'
import { SearchInput } from '@/features/faculty-dashboard/components/SearchInput'
import { FilterBar, type FilterBarConfig } from '@/features/faculty-dashboard/components/FilterBar'
import { StudentDetailModal } from '@/features/faculty-dashboard/components/StudentDetailModal'
import { useStudentList } from '@/features/faculty-dashboard/api/useStudentList'
import { useAuth } from '@/shared/hooks/useAuth'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { DeptStudentRow } from '../api/useDepartmentDetail'
import type { FilterOptions } from '@/shared/types'
import { Building2 } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  enrolled: 'bg-indigo-500/20 text-indigo-300',
  completed: 'bg-emerald-500/20 text-emerald-300',
  dropped: 'bg-red-500/20 text-red-300',
}

const STUDENT_COLS: ColumnDef<DeptStudentRow>[] = [
  { key: 'sno', header: '#', className: 'w-12 text-slate-400' },
  { key: 'student_name', header: 'Student Name', sortable: true },
  { key: 'register_no', header: 'Register No', sortable: true },
  { key: 'program', header: 'Program' },
  { key: 'subject_code', header: 'Subject Code' },
  { key: 'subject_name', header: 'Subject' },
  {
    key: 'mobile',
    header: 'Mobile',
    render: (v) => <span className="font-mono text-xs">{(v as string) || '—'}</span>,
  },
  { key: 'email', header: 'Email' },
  {
    key: 'status',
    header: 'Status',
    render: (v) => (
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[v as string] ?? 'bg-slate-500/20 text-slate-300'}`}
      >
        {v as string}
      </span>
    ),
  },
]

interface StudentEnrollmentTabProps {
  rows?: DeptStudentRow[]
  isLoading?: boolean
}

type ExtendedStudentRow = DeptStudentRow & { department_name?: string }

export function StudentEnrollmentTab({ rows: propsRows, isLoading: propsIsLoading }: StudentEnrollmentTabProps) {
  const { role, departmentName } = useAuth()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 250)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  const isStandalone = propsRows === undefined

  // Active department scope for HOD/Dean
  const activeDeptScope = filters.department || departmentName || null

  const studentListQuery = useStudentList({
    filters,
    search: debouncedSearch,
    departmentName: (role === 'hod' || role === 'dean') ? departmentName : null,
  })

  const isLoading = isStandalone ? studentListQuery.isLoading : (propsIsLoading ?? false)

  const rawRows: ExtendedStudentRow[] = useMemo(() => {
    if (isStandalone) {
      return (studentListQuery.data?.rows ?? []) as ExtendedStudentRow[]
    }
    return propsRows ?? []
  }, [isStandalone, studentListQuery.data?.rows, propsRows])

  const filteredRows = useMemo(() => {
    let rows = rawRows

    // Enforce HOD / Dean department filtering if specified
    if (activeDeptScope) {
      const scopeLower = activeDeptScope.toLowerCase()
      rows = rows.filter((r) => {
        const prog = r.program?.toLowerCase() ?? ''
        const dept = r.department_name?.toLowerCase() ?? ''
        return prog.includes(scopeLower) || dept.includes(scopeLower)
      })
    }

    return rows.filter((r) => {
      if (filters.status && r.status !== filters.status) return false
      if (filters.program && r.program !== filters.program) return false
      if (
        filters.subject &&
        r.subject_code !== filters.subject &&
        !r.subject_name.toLowerCase().includes(filters.subject.toLowerCase())
      ) {
        return false
      }
      if (filters.department && r.department_name && r.department_name !== filters.department) {
        return false
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const matchName = r.student_name?.toLowerCase().includes(q)
        const matchReg = r.register_no?.toLowerCase().includes(q)
        const matchEmail = r.email?.toLowerCase().includes(q)
        const matchSubCode = r.subject_code?.toLowerCase().includes(q)
        const matchSubName = r.subject_name?.toLowerCase().includes(q)
        const matchProgram = r.program?.toLowerCase().includes(q)
        if (!matchName && !matchReg && !matchEmail && !matchSubCode && !matchSubName && !matchProgram) {
          return false
        }
      }
      return true
    })
  }, [rawRows, activeDeptScope, filters, search])

  const filterOptions = useMemo<FilterBarConfig>(() => {
    const baseRows = isStandalone ? ((studentListQuery.data?.rows ?? []) as ExtendedStudentRow[]) : rawRows
    const programs = [...new Set(baseRows.map((r) => r.program).filter(Boolean))]
    const subjects = [...new Map(baseRows.map((r) => [r.subject_code, r.subject_name]))]
    const depts = [...new Set(baseRows.map((r) => r.department_name).filter((d): d is string => Boolean(d)))]

    return {
      ...(depts.length > 0 ? { department: depts.map((d) => ({ value: d, label: d })) } : {}),
      program: programs.map((p) => ({ value: p, label: p })),
      subject: subjects.map(([code, name]) => ({ value: code, label: `${code} – ${name}` })),
      status: [
        { value: 'enrolled', label: 'Enrolled' },
        { value: 'completed', label: 'Completed' },
        { value: 'dropped', label: 'Dropped' },
      ],
    }
  }, [isStandalone, studentListQuery.data?.rows, rawRows])

  function handleFilterChange(key: keyof FilterOptions, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }

  function handleResetFilters() {
    setFilters({})
    setSearch('')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Department Scope Banner */}
      {activeDeptScope && (
        <div className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-medium text-violet-300 backdrop-blur">
          <Building2 className="h-4 w-4 text-violet-400 shrink-0" />
          <span>Showing students for department: <strong className="font-semibold text-white">{activeDeptScope}</strong></span>
        </div>
      )}

      {/* Toolbar with Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Search name, register no, subject…"
          className="w-72"
        />
        <FilterBar
          filters={filters}
          options={filterOptions}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Data Table */}
      <DataTable<DeptStudentRow>
        columns={STUDENT_COLS}
        rows={filteredRows}
        isLoading={isLoading}
        rowKey={(r) => `${r.student_id}-${r.subject_code}`}
        onRowClick={(r) => setSelectedStudentId(r.student_id)}
        emptyMessage="No enrolled students found."
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

