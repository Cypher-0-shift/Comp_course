import { useState, useMemo } from 'react'
import { DataTable, type ColumnDef } from '@/features/faculty-dashboard/components/DataTable'
import { SearchInput } from '@/features/faculty-dashboard/components/SearchInput'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { type FacultyAssignmentRow } from '../api/useDepartmentDetail'

const FACULTY_COLS: ColumnDef<FacultyAssignmentRow>[] = [
  { key: 'sno', header: '#', className: 'w-12 text-slate-400 font-mono text-xs' },
  { key: 'faculty_name', header: 'Faculty Name', sortable: true, className: 'font-semibold text-slate-100' },
  { key: 'emp_id', header: 'Emp ID', className: 'font-mono text-xs text-violet-300 font-bold' },
  { key: 'subject_code', header: 'Subject Code', className: 'font-mono text-xs text-violet-300 font-bold' },
  { key: 'subject_name', header: 'Subject Name', className: 'text-slate-100 font-semibold text-xs' },
  {
    key: 'mobile',
    header: 'Mobile',
    render: (v) => <span className="font-mono text-xs text-slate-300">{(v as string) || '—'}</span>,
  },
]

interface FacultyAssignmentsTabProps {
  rows: FacultyAssignmentRow[]
  isLoading: boolean
}

export function FacultyAssignmentsTab({ rows, isLoading }: FacultyAssignmentsTabProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 250)

  const filteredRows = useMemo(() => {
    if (!debouncedSearch.trim()) return rows
    const q = debouncedSearch.trim().toLowerCase()
    return rows.filter((r) => {
      const matchName = r.faculty_name?.toLowerCase().includes(q)
      const matchEmp = r.emp_id?.toLowerCase().includes(q)
      const matchSubCode = r.subject_code?.toLowerCase().includes(q)
      const matchSubName = r.subject_name?.toLowerCase().includes(q)
      return matchName || matchEmp || matchSubCode || matchSubName
    })
  }, [rows, debouncedSearch])

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar Search Input */}
      <div className="flex items-center gap-3">
        <SearchInput
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Search faculty name, Emp ID, subject…"
          className="w-72"
        />
      </div>

      {/* Data Table */}
      <DataTable<FacultyAssignmentRow>
        columns={FACULTY_COLS}
        rows={filteredRows}
        isLoading={isLoading}
        rowKey={(r) => `${r.faculty_id}-${r.subject_code}-${r.sno}`}
        emptyMessage="No faculty assignments found for this selection."
      />
    </div>
  )
}
