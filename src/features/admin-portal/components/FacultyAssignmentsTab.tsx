import { useState, useMemo } from 'react'
import { DataTable, type ColumnDef } from '@/features/faculty-dashboard/components/DataTable'
import { SearchInput } from '@/features/faculty-dashboard/components/SearchInput'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { type FacultyAssignmentRow } from '../api/useDepartmentDetail'

import { Users, Building2 } from 'lucide-react'

const FACULTY_COLS: ColumnDef<FacultyAssignmentRow>[] = [
  { key: 'sno', header: 'S.NO', className: 'w-16' },
  { key: 'faculty_name', header: 'FACULTY NAME', sortable: true, className: 'min-w-[160px]' },
  { key: 'emp_id', header: 'EMP ID', className: 'min-w-[90px]' },
  {
    key: 'department_name' as keyof FacultyAssignmentRow,
    header: 'DEPARTMENT',
    className: 'min-w-[140px]',
    render: (v, r) => (
      <span className="inline-flex items-center gap-1 font-normal text-slate-700">
        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        {(v as string) || (r as any).department || '—'}
      </span>
    ),
  },
  {
    key: 'subject_code',
    header: 'SUBJECT CODE',
    className: 'min-w-[140px]',
    render: (v) => {
      const val = (v as string) || ''
      const codes = val.includes(' | ') ? val.split(' | ') : val.split(', ')
      return (
        <div className="flex flex-col gap-1.5 py-1">
          {codes.map((c, i) => (
            <span key={i} className="inline-block px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 w-fit">
              {c}
            </span>
          ))}
        </div>
      )
    },
  },
  {
    key: 'subject_name',
    header: 'SUBJECT NAME',
    className: 'min-w-[240px]',
    render: (v) => {
      const val = (v as string) || ''
      const names = val.includes(' | ') ? val.split(' | ') : val.split(', ')
      return (
        <div className="flex flex-col gap-1.5 py-1">
          {names.map((n, i) => (
            <div key={i} className="text-slate-700 font-normal leading-relaxed text-sm h-[23px] flex items-center">
              {n}
            </div>
          ))}
        </div>
      )
    },
  },
  {
    key: 'mobile',
    header: 'MOBILE',
    className: 'min-w-[120px]',
    render: (v) => <span className="text-xs text-slate-500 font-normal">{(v as string) || '—'}</span>,
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
    <div className="lg-table-container overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="relative max-w-md w-full">
          <SearchInput
            value={search}
            onChange={(v) => setSearch(v)}
            placeholder="Search faculty name, Emp ID, subject…"
          />
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <Users className="w-4 h-4" />
          <span>Total: {filteredRows.length}</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="w-full">
        <DataTable<FacultyAssignmentRow>
          columns={FACULTY_COLS}
          rows={filteredRows}
          isLoading={isLoading}
          rowKey={(r) => `${r.faculty_id}-${r.subject_code}-${r.sno}`}
          emptyMessage="No faculty assignments found for this selection."
        />
      </div>
    </div>
  )
}
