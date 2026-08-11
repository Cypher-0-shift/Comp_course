import { useState, useMemo } from 'react'
import { DataTable, type ColumnDef } from '@/features/faculty-dashboard/components/DataTable'
import { SearchInput } from '@/features/faculty-dashboard/components/SearchInput'
import { FilterBar, type FilterBarConfig } from '@/features/faculty-dashboard/components/FilterBar'
import { StudentDetailModal } from '@/features/faculty-dashboard/components/StudentDetailModal'
import { useStudentList } from '@/features/faculty-dashboard/api/useStudentList'
import { useAuth } from '@/shared/hooks/useAuth'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useDepartmentList } from '@/features/faculty-dashboard/api/useDepartmentList'
import { useSubjectList } from '@/features/faculty-dashboard/api/useSubjectList'
import type { DeptStudentRow } from '../api/useDepartmentDetail'
import type { FilterOptions } from '@/shared/types'
import { Users } from 'lucide-react'



const STUDENT_COLS: ColumnDef<DeptStudentRow>[] = [
  { key: 'sno', header: 'S.NO', className: 'w-16' },
  { key: 'student_name', header: 'STUDENT NAME', sortable: true, className: 'min-w-[160px]' },
  { key: 'register_no', header: 'REGISTER NO', sortable: true, className: 'min-w-[140px]' },
  { key: 'program', header: 'PROGRAM', className: 'min-w-[200px]' },
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
  { key: 'email', header: 'EMAIL', className: 'min-w-[180px]' },
]

interface StudentEnrollmentTabProps {
  rows?: DeptStudentRow[]
  isLoading?: boolean
}

type ExtendedStudentRow = DeptStudentRow & { department_name?: string }

export function StudentEnrollmentTab({ rows: propsRows, isLoading: propsIsLoading }: StudentEnrollmentTabProps) {
  const { role, departmentName } = useAuth()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  // Fetch departments for dynamic dropdown
  const { data: deptList } = useDepartmentList()
  const { data: subjectList } = useSubjectList()
  const [filters, setFilters] = useState<FilterOptions>({})
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  const isStandalone = propsRows === undefined

  // Fetch student list dynamically when rendered as standalone route tab
  const { data: standaloneData, isLoading: standaloneIsLoading } = useStudentList(
    isStandalone
      ? {
          filters,
          search: debouncedSearch,
          pagination: { page: 1, pageSize: 100 },
          crossDept: true,
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
      department_code: r.department_name,
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
      const matchName = (r.student_name || '').toLowerCase().includes(q)
      const matchReg = (r.register_no || '').toLowerCase().includes(q)
      const matchEmail = (r.email || '').toLowerCase().includes(q)
      const matchSubCode = (r.subject_code || '').toLowerCase().includes(q)
      return matchName || matchReg || matchEmail || matchSubCode
    })
  }, [isStandalone, rawRows, debouncedSearch])

  // FilterBar configuration for standalone view
  const filterOptions: FilterBarConfig = useMemo(() => {
    if (!isStandalone) return {}
    const opts: FilterBarConfig = {
      status: [
        { label: 'All Statuses', value: '' },
        { label: 'Enrolled', value: 'enrolled' },
        { label: 'Completed', value: 'completed' },
        { label: 'Dropped', value: 'dropped' },
      ],
      subject: [
        { label: 'All Subjects', value: '' },
        ...(subjectList ?? []),
      ],
    }

    if (role === 'dean' || role === 'hod' || role === 'faculty') {
      const dynamicDepts = (deptList ?? []).map((d) => ({
        label: d.department_name,
        value: d.department_name,
      }))
      opts.department = [
        { label: 'All Departments', value: '' },
        ...dynamicDepts,
      ]
    }

    return opts
  }, [isStandalone, role, deptList, subjectList])

  const columns = STUDENT_COLS

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

      {/* Toolbar & Data Table Combined */}
      <div className="lg-table-container overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <SearchInput
              value={search}
              onChange={(v) => setSearch(v)}
              placeholder="Search student name, Register No, email..."
            />
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <Users className="w-4 h-4" />
            <span>Total: {displayRows.length}</span>
          </div>

        {isStandalone && Object.keys(filterOptions).length > 0 && (
          <div className="w-full sm:w-auto">
            <FilterBar
              options={filterOptions}
              filters={filters}
              onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
              onReset={() => setFilters({})}
            />
          </div>
        )}
        </div>

        {/* Data Table */}
        <div className="w-full">
          <DataTable<DeptStudentRow>
            columns={columns}
            rows={displayRows}
            isLoading={isLoading}
            rowKey={(r) => `${r.student_id}-${r.subject_code}-${r.sno}`}
            onRowClick={(r) => setSelectedStudentId(r.student_id)}
            emptyMessage="No student enrollments found matching your criteria."
          />
        </div>
      </div>

      {/* Student Details Drawer/Modal */}
      <StudentDetailModal
        studentId={selectedStudentId}
        open={Boolean(selectedStudentId)}
        onClose={() => setSelectedStudentId(null)}
      />
    </div>
  )
}
