import { useDepartmentList, type DepartmentListRow } from '../api/useDepartmentList'
import { DataTable, type ColumnDef } from './DataTable'
import { Users, Building2, Layers } from 'lucide-react'

const COLUMNS: ColumnDef<DepartmentListRow>[] = [
  { key: 'sno', header: '#', className: 'w-12 text-slate-500 font-mono text-xs' },
  { key: 'department_code', header: 'Dept Code', className: 'font-mono text-xs text-indigo-300 font-bold' },
  { key: 'department_name', header: 'Department Name', sortable: true, className: 'font-semibold text-slate-100' },
  {
    key: 'students_registered',
    header: 'Students Registered',
    render: (v) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-indigo-400" />
        <span className="font-extrabold text-slate-100">{v as number}</span>
        <span className="text-[11px] text-slate-500 font-normal">Students</span>
      </div>
    ),
  },
]

export function DepartmentListTab() {
  const { data: rows = [], isLoading } = useDepartmentList()

  // Calculate stats
  const totalStudents = rows.reduce((sum, r) => sum + r.students_registered, 0)
  const avgPerDept = rows.length ? Math.round(totalStudents / rows.length) : 0

  function renderExpandedDepartmentRow(r: DepartmentListRow) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Department Profile</p>
          <p className="font-bold text-sm text-slate-100">{r.department_name}</p>
          <p className="font-mono text-indigo-300">Code: {r.department_code}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Enrollment Metrics</p>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            <span className="font-bold text-slate-100">{r.students_registered} Registered Students</span>
          </div>
          <p className="text-slate-400">Active Compensatory Courses</p>
        </div>
        <div className="flex flex-col justify-center items-start sm:items-end">
          <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300">
            Active Department Unit
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Summary Banner Cards */}
      {!isLoading && rows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Departments</p>
              <p className="text-2xl font-extrabold text-slate-100 tracking-tight">{rows.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/30">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Students</p>
              <p className="text-2xl font-extrabold text-slate-100 tracking-tight">{totalStudents}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 ring-1 ring-purple-500/30">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg Enrollment / Dept</p>
              <p className="text-2xl font-extrabold text-slate-100 tracking-tight">{avgPerDept}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Department Data Table */}
      <DataTable<DepartmentListRow>
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        rowKey={(r) => r.department_id}
        renderExpandedRow={renderExpandedDepartmentRow}
        emptyMessage="No department analytics records available."
      />
    </div>
  )
}
