import { useState, useMemo } from 'react'
import { useStudentList, type StudentListRow } from '../api/useStudentList'
import { DataTable, type ColumnDef } from './DataTable'
import { SearchInput } from './SearchInput'
import { FilterBar, type FilterBarConfig } from './FilterBar'
import { StudentDetailModal } from './StudentDetailModal'
import type { FilterOptions } from '@/shared/types'

const STATUS_BADGE: Record<string, string> = {
  enrolled: 'bg-indigo-500/20 text-indigo-300',
  completed: 'bg-emerald-500/20 text-emerald-300',
  dropped: 'bg-red-500/20 text-red-300',
}

const COLUMNS: ColumnDef<StudentListRow>[] = [
  { key: 'sno', header: '#', className: 'w-12 text-slate-400' },
  { key: 'student_name', header: 'Student Name', sortable: true },
  { key: 'register_no', header: 'Register No', sortable: true },
  { key: 'program', header: 'Program' },
  {
    key: 'mobile',
    header: 'Mobile',
    render: (v) => <span className="font-mono text-xs">{(v as string) || '—'}</span>,
  },
  { key: 'email', header: 'Email' },
  { key: 'subject_code', header: 'Subject Code' },
  { key: 'subject_name', header: 'Subject' },
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

export function StudentListTab() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  const { data, isLoading } = useStudentList({
    filters,
    search,
  })

  const rawRows = data?.rows

  const rows = useMemo(() => rawRows ?? [], [rawRows])

  // Build filter dropdown options from current data
  const filterOptions = useMemo<FilterBarConfig>(() => {
    const programs = [...new Set(rows.map((r) => r.program).filter(Boolean))]
    const subjects = [...new Map(rows.map((r) => [r.subject_code, r.subject_name]))]
    return {
      program: programs.map((p) => ({ value: p, label: p })),
      subject: subjects.map(([code, name]) => ({ value: code, label: `${code} – ${name}` })),
      status: [
        { value: 'enrolled', label: 'Enrolled' },
        { value: 'completed', label: 'Completed' },
        { value: 'dropped', label: 'Dropped' },
      ],
    }
  }, [rows])

  function handleFilterChange(key: keyof FilterOptions, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }

  function handleResetFilters() {
    setFilters({})
    setSearch('')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
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

      {/* Table */}
      <DataTable<StudentListRow>
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        rowKey={(r) => `${r.student_id}-${r.subject_code}`}
        onRowClick={(r) => setSelectedStudentId(r.student_id)}
        emptyMessage="No students found for your assigned courses."
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
