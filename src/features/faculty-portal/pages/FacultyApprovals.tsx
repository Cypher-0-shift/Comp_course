import { ApprovalsQueue } from '@/shared/components/ApprovalsQueue'

export function FacultyApprovals() {
  return (
    <div className="space-y-6 md:space-y-8 h-full flex flex-col">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#001941] tracking-tight">Course Approvals</h2>
        <p className="text-sm text-slate-500 mt-1">Track the status of pending approvals and requests from the HOD.</p>
      </div>

      <div className="flex-1 min-h-0">
        <ApprovalsQueue role="faculty" />
      </div>
    </div>
  )
}
