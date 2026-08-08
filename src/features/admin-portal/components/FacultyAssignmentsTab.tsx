import { DataTable, type ColumnDef } from '@/features/faculty-dashboard/components/DataTable'
import { type FacultyAssignmentRow } from '../api/useDepartmentDetail'

const FACULTY_COLS: ColumnDef<FacultyAssignmentRow>[] = [
  { key: 'sno', header: '#', className: 'w-12 text-slate-400' },
  { key: 'faculty_name', header: 'Faculty Name', sortable: true },
  { key: 'emp_id', header: 'Emp ID', className: 'font-mono text-xs' },
  { key: 'subject_code', header: 'Subject Code' },
  { key: 'subject_name', header: 'Subject Name' },
  {
    key: 'mobile',
    header: 'Mobile',
    render: (v) => <span className="font-mono text-xs">{(v as string) || '—'}</span>,
  },
]

interface FacultyAssignmentsTabProps {
  rows: FacultyAssignmentRow[]
  isLoading: boolean
}

export function FacultyAssignmentsTab({ rows, isLoading }: FacultyAssignmentsTabProps) {
  return (
    <DataTable<FacultyAssignmentRow>
      columns={FACULTY_COLS}
      rows={rows}
      isLoading={isLoading}
      rowKey={(r) => `${r.faculty_id}-${r.subject_id}`}
      emptyMessage="No faculty assignments for this department."
    />
  )
}
