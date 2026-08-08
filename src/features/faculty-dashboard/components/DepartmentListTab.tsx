import { useDepartmentList, type DepartmentListRow } from '../api/useDepartmentList'
import { DataTable, type ColumnDef } from './DataTable'
import { Users } from 'lucide-react'

const COLUMNS: ColumnDef<DepartmentListRow>[] = [
  { key: 'sno', header: '#', className: 'w-12 text-slate-400' },
  { key: 'department_code', header: 'Code', className: 'font-mono text-xs' },
  { key: 'department_name', header: 'Department Name', sortable: true },
  {
    key: 'students_registered',
    header: 'Students Registered',
    render: (v) => (
      <div className="flex items-center gap-2">
        <Users className="h-3.5 w-3.5 text-slate-500" />
        <span className="font-semibold text-slate-200">{v as number}</span>
      </div>
    ),
  },
]

export function DepartmentListTab() {
  const { data: rows = [], isLoading } = useDepartmentList()

  // Calculate total for a summary card
  const totalStudents = rows.reduce((sum, r) => sum + r.students_registered, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Summary card */}
      {!isLoading && rows.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <Users className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-xs text-slate-400">Total Students</p>
              <p className="text-xl font-bold text-slate-100">{totalStudents}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="h-5 w-5 rounded-full bg-indigo-500/30 text-center text-xs font-bold leading-5 text-indigo-300">
              {rows.length}
            </div>
            <div>
              <p className="text-xs text-slate-400">Departments</p>
              <p className="text-xl font-bold text-slate-100">{rows.length}</p>
            </div>
          </div>
        </div>
      )}

      <DataTable<DepartmentListRow>
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        rowKey={(r) => r.department_id}
        emptyMessage="No department data available."
      />
    </div>
  )
}
