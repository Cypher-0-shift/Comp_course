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
  enrolled: 'bg-blue-50 text-blue-700 border border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  dropped: 'bg-rose-50 text-rose-700 border border-rose-200',
}

const STUDENT_COLS: ColumnDef<DeptStudentRow>[] = [
  { key: 'sno', header: '#', className: 'w-12 text-slate-400 font-mono text-xs' },
  { key: 'student_name', header: 'Student Name', sortable: true },
  { key: 'register_no', header: 'Register No', sortable: true, className: 'font-mono text-xs text-[#001941] font-bold' },
  { key: 'program', header: 'Program' },
  { key: 'subject_code', header: 'Subject Code', className: 'font-mono text-xs text-slate-700 font-bold' },
  { key: 'subject_name', header: 'Subject' },
  {
    key: 'mobile',
    header: 'Mobile',
    render: (v) => <span className="font-mono text-xs text-slate-500">{(v as string) || '—'}</span>,
  },
  { key: 'email', header: 'Email' },
  {
    key: 'status',
    header: 'Status',
    render: (v) => (
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${STATUS_BADGE[v as string] ?? 'bg-slate-100 text-slate-600 border border-slate-200'}`}
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

  // Fetch student list dynamically when rendered as standalone route tab
  const { data: standaloneData, isLoading: standaloneIsLoading } = useStudentList(
    isStandalone
      ? {
          filters,
          search: debouncedSearch,
          page: 1,
          pageSize: 100,
        }
      : { filters: {}, search: '' }
  )

  // Determine active rows & loading state
  const rawRows: ExtendedStudentRow[] = useMemo(() => {
    if (!isStandalone) return (propsRows ?? []) as ExtendedStudentRow[]
    return (standaloneData?.rows ?? []).map((r) => ({
      sno: r.sno,
      student_id: r.student_id,
      student_name: r.student_name,
      register_no: r.register_no,
      program: r.program,
      mobile: r.mobile,
      email: r.email,
      department_code: r.department_code,
      department_name: r.department_name,
      subject_code: r.subject_code,
      subject_name: r.subject_name,
      status: r.status,
    }))
  }, [isStandalone, propsRows, standaloneData])

  const isLoading = isStandalone ? standaloneIsLoading : (propsIsLoading ?? false)

  // Local filtering for prop-passed rows (when filtered in DepartmentDetail)
  const displayRows = useMemo(() => {
    if (isStandalone) return rawRows
    if (!debouncedSearch.trim()) return rawRows
    const q = debouncedSearch.trim().toLowerCase()
    return rawRows.filter((r) => {
      const matchName = r.student_name?.toLowerCase().includes(q)
      const matchReg = r.register_no?.toLowerCase().includes(q)
      const matchEmail = r.email?.toLowerCase().includes(q)
      const matchSubCode = r.subject_code?.toLowerCase().includes(q)
      return matchName || matchReg || matchEmail || matchSubCode
    })
  }, [isStandalone, rawRows, debouncedSearch])

  // FilterBar configuration for standalone view
  const filterConfigs: FilterBarConfig[] = useMemo(() => {
    if (!isStandalone) return []
    const configs: FilterBarConfig[] = [
      {
        key: 'status',
        label: 'Enrollment Status',
        options: [
          { label: 'All Statuses', value: '' },
          { label: 'Enrolled', value: 'enrolled' },
          { label: 'Completed', value: 'completed' },
          { label: 'Dropped', value: 'dropped' },
        ],
      },
      {
        key: 'subject_code',
        label: 'Subject Code',
        options: [
          { label: 'All Subjects', value: '' },
          { label: '18CSC301J – Compiler Design', value: '18CSC301J' },
          { label: '18CSC302J – Computer Networks', value: '18CSC302J' },
          { label: '18CSC305J – Machine Learning', value: '18CSC305J' },
        ],
      },
    ]

    // Executive Deans see Department filter
    if (role === 'dean' || role === 'admin') {
      configs.unshift({
        key: 'department_id',
        label: 'Department',
        options: [
          { label: 'All Departments', value: '' },
          { label: 'CSE', value: 'CSE' },
          { label: 'ECE', value: 'ECE' },
          { label: 'IT', value: 'IT' },
        ],
      })
    }

    return configs
  }, [isStandalone, role])

  // Dynamic columns: Include Department Name column for Deans in standalone mode
  const columns = useMemo(() => {
    if (isStandalone && (role === 'dean' || role === 'admin')) {
      const cols = [...STUDENT_COLS]
      cols.splice(4, 0, {
        key: 'department_name' as keyof DeptStudentRow,
        header: 'Department',
        render: (v, r) => (
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {(v as string) || (r as ExtendedStudentRow).department_code || '—'}
          </span>
        ),
      })
      return cols
    }
    return STUDENT_COLS
  }, [isStandalone, role])

  return (
    <div className="flex flex-col gap-4">
      {/* Standalone Header Context Banner */}
      {isStandalone && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pb-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#001941]">Active Directory View:</span>
            <span className="lg-pill-slate px-2.5 py-0.5 font-bold text-[#001941]">
              {role === 'hod' ? `Department: ${departmentName || 'HOD Access'}` : 'Executive All-Department Access'}
            </span>
          </div>
          <span className="font-semibold text-slate-400">Total Records: {displayRows.length} Students</span>
        </div>
      )}

      {/* Toolbar: Search & Optional FilterBar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Search student name, Register No, email..."
          className="w-full sm:w-80"
        />

        {isStandalone && filterConfigs.length > 0 && (
          <FilterBar
            configs={filterConfigs}
            activeFilters={filters}
            onFilterChange={(newFilters) => setFilters(newFilters)}
          />
        )}
      </div>

      {/* Data Table */}
      <div className="lg-table-container">
        <DataTable<DeptStudentRow>
          columns={columns}
          rows={displayRows}
          isLoading={isLoading}
          rowKey={(r) => `${r.student_id}-${r.subject_code}-${r.sno}`}
          onRowClick={(r) => setSelectedStudentId(r.student_id)}
          emptyMessage="No student enrollments found matching your criteria."
        />
      </div>

      {/* Student Details Drawer/Modal */}
      <StudentDetailModal
        studentId={selectedStudentId}
        isOpen={Boolean(selectedStudentId)}
        onClose={() => setSelectedStudentId(null)}
      />
    </div>
  )
}
