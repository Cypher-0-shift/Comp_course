import { useState, useMemo } from 'react'
import { useFacultyList, type FacultyListRow } from '../api/useFacultyList'
import { DataTable, type ColumnDef } from './DataTable'
import { SearchInput } from './SearchInput'
import { FilterBar, type FilterBarConfig } from './FilterBar'
import type { FilterOptions } from '@/shared/types'

const COLUMNS: ColumnDef<FacultyListRow>[] = [
  { key: 'sno', header: '#', className: 'w-12 text-slate-400' },
  { key: 'subject_code', header: 'Subject Code', sortable: true },
  { key: 'subject_name', header: 'Subject Name', sortable: true },
  {
    key: 'students_registered',
    header: 'Students Registered',
    render: (v) => (
      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-indigo-500/20 px-2 text-xs font-semibold text-indigo-300">
        {v as number}
      </span>
    ),
  },
  { key: 'faculty_name', header: 'Faculty Name', sortable: true },
  { key: 'department_name', header: 'Department' },
  { key: 'emp_id', header: 'Emp ID', className: 'font-mono text-xs' },
  {
    key: 'mobile',
    header: 'Mobile Number',
    render: (v) => <span className="font-mono text-xs">{(v as string) || '—'}</span>,
  },
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
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Search faculty, subject, emp ID…"
          className="w-72"
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

      <DataTable<FacultyListRow>
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        rowKey={(r) => `${r.subject_id}`}
        emptyMessage="No faculty assignments found for your department."
      />
    </div>
  )
}
