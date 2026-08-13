import { useState, useMemo } from 'react'
import { useFacultyList, type FacultyListRow } from '../api/useFacultyList'
import { DataTable, type ColumnDef } from './DataTable'
import { SearchInput } from './SearchInput'
import { FilterBar, type FilterBarConfig } from './FilterBar'
import type { FilterOptions } from '@/shared/types'
import { Users, Building2, Phone, BookOpen, ShieldCheck } from 'lucide-react'

const COLUMNS: ColumnDef<FacultyListRow>[] = [
  { key: 'sno', header: '#', className: 'w-12 text-slate-500 font-mono text-xs' },
  { key: 'subject_code', header: 'Subject Code', sortable: true, className: 'font-mono text-xs text-indigo-300' },
  { key: 'subject_name', header: 'Subject Name', sortable: true },
  {
    key: 'students_registered',
    header: 'Students Enrolled',
    render: (v) => (
      <div className="flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5 text-indigo-400" />
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-indigo-500/20 px-2 text-xs font-bold text-indigo-300 border border-indigo-500/30">
          {v as number}
        </span>
      </div>
    ),
  },
  { key: 'faculty_name', header: 'Faculty Name', sortable: true, className: 'font-bold text-slate-100' },
  { key: 'department_name', header: 'Department' },
  { key: 'emp_id', header: 'Emp ID', className: 'font-mono text-xs text-slate-400' },
]

export function FacultyListTab() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})

  const { data, isLoading } = useFacultyList({
    filters,
    search,
  })

  const rawRows = data?.rows
  const rows = useMemo(() => rawRows ?? [], [rawRows])

  const filterOptions = useMemo<FilterBarConfig>(() => {
    const depts = [...new Set(rows.map((r) => r.department_name).filter(Boolean))]
    const subjects = [...new Map(rows.map((r) => [r.subject_code, r.subject_name]))]
    return {
      department: depts.map((d) => ({ value: d, label: d })),
      subject: subjects.map(([code, name]) => ({ value: code, label: `${code} – ${name}` })),
    }
  }, [rows])

  function handleFilterChange(key: keyof FilterOptions, value: string) {
    setFilters((prev: FilterOptions) => ({ ...prev, [key]: value || undefined }))
  }

  function renderExpandedFacultyRow(r: FacultyListRow) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Faculty Details</p>
          <p className="font-bold text-sm text-slate-100">{r.faculty_name}</p>
          <p className="font-mono text-indigo-300">Emp ID: {r.emp_id}</p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            <span>{r.department_name}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Subject Assignment</p>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-100">{r.subject_code}: {r.subject_name}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Phone className="h-3.5 w-3.5" />
            <span className="font-mono">{r.mobile || 'Contact details private'}</span>
          </div>
        </div>

        <div className="flex flex-col justify-between items-start md:items-end gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Faculty Instructor
          </span>
          <p className="text-[11px] text-slate-400">{r.students_registered} Total Enrolled Students</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Search faculty name, subject, emp ID..."
          className="w-full sm:w-80"
        />
        <FilterBar
          filters={filters}
          options={filterOptions}
          onChange={handleFilterChange}
          onReset={() => {
            setFilters({})
            setSearch('')
          }}
        />
      </div>

      {/* Main Table */}
      <DataTable<FacultyListRow>
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        rowKey={(r) => `${r.subject_id}`}
        renderExpandedRow={renderExpandedFacultyRow}
        emptyMessage="No faculty assignment records found for department filters."
      />
    </div>
  )
}
