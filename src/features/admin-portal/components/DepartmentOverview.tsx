import { useNavigate } from 'react-router-dom'
import { useDepartmentOverview, type DepartmentOverviewRow } from '../api/useDepartmentOverview'
import { DataTable, type ColumnDef } from '@/features/faculty-dashboard/components/DataTable'
import { Users, ExternalLink } from 'lucide-react'

const COLUMNS: ColumnDef<DepartmentOverviewRow>[] = [
  { key: 'sno', header: '#', className: 'w-12 text-slate-400' },
  { key: 'department_code', header: 'Code', className: 'font-mono text-xs' },
  {
    key: 'department_name',
    header: 'Department Name',
    render: (v) => (
      <span className="font-medium text-slate-200">{v as string}</span>
    ),
  },
  {
    key: 'students_registered',
    header: 'Students Registered',
    render: (v) => (
      <div className="flex items-center gap-2">
        <Users className="h-3.5 w-3.5 text-slate-500" />
        <span className="font-semibold text-indigo-300">{v as number}</span>
      </div>
    ),
  },
  {
    key: 'department_id',
    header: '',
    className: 'w-10',
    render: () => (
      <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
    ),
  },
]

export function DepartmentOverview() {
  const navigate = useNavigate()
  const { data: rows = [], isLoading } = useDepartmentOverview()

  const totalStudents = rows.reduce((s, r) => s + r.students_registered, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Summary stats */}
      {!isLoading && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <Users className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-xs text-slate-400">Total Students</p>
              <p className="text-2xl font-bold text-slate-100">{totalStudents}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/30 text-xs font-bold text-indigo-300">
              {rows.length}
            </div>
            <div>
              <p className="text-xs text-slate-400">Departments</p>
              <p className="text-2xl font-bold text-slate-100">{rows.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Department table */}
      <DataTable<DepartmentOverviewRow>
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        rowKey={(r) => r.department_id}
        onRowClick={(r) => navigate(`/admin/departments/${r.department_id}`)}
        emptyMessage="No departments found."
      />
      <p className="text-xs text-slate-500">Click a department row to see faculty assignments and enrolled students.</p>
    </div>
  )
}
