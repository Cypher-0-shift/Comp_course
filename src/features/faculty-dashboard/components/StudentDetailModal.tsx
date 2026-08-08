import * as Dialog from '@radix-ui/react-dialog'
import { X, Hash, GraduationCap, Phone, Mail, Building2, BookOpen } from 'lucide-react'
import { useStudentDetail } from '../api/useStudentDetail'
import { cn } from '@/shared/utils/cn'

interface StudentDetailModalProps {
  studentId: string | null
  open: boolean
  onClose: () => void
}

const STATUS_STYLES: Record<string, string> = {
  enrolled: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
  completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  dropped: 'bg-red-500/20 text-red-300 border-red-400/30',
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5">
        <Icon className="h-3.5 w-3.5 text-indigo-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-200">{value || '—'}</p>
      </div>
    </div>
  )
}

export function StudentDetailModal({ studentId, open, onClose }: StudentDetailModalProps) {
  const { data: student, isLoading } = useStudentDetail(studentId)

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Panel */}
        <Dialog.Content
          className={cn(
            'fixed right-0 top-0 z-50 h-full w-full max-w-md',
            'border-l border-white/10 bg-slate-950 shadow-2xl',
            'overflow-y-auto focus:outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
            'duration-300'
          )}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-6 py-4 backdrop-blur">
            <Dialog.Title className="text-base font-semibold text-slate-100">
              Student Profile
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                id="student-detail-close"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-16 rounded-xl bg-white/5" />
                <div className="h-4 rounded bg-white/5 w-3/4" />
                <div className="h-4 rounded bg-white/5 w-1/2" />
                <div className="h-4 rounded bg-white/5 w-2/3" />
                <div className="h-4 rounded bg-white/5 w-3/4" />
                <div className="mt-6 h-6 rounded bg-white/5 w-1/3" />
                <div className="h-32 rounded-xl bg-white/5" />
              </div>
            ) : student ? (
              <div className="space-y-6">
                {/* Avatar + name */}
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-xl font-bold text-indigo-300 border border-indigo-400/20">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-100">{student.name}</h2>
                    <p className="text-sm text-slate-400">{student.register_no}</p>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <InfoRow icon={GraduationCap} label="Program" value={student.program} />
                  <InfoRow icon={Building2} label="Department" value={student.department_name} />
                  <InfoRow icon={Phone} label="Mobile" value={student.mobile} />
                  <InfoRow icon={Mail} label="Email" value={student.email} />
                  <InfoRow icon={Hash} label="Register No." value={student.register_no} />
                </div>

                {/* Enrollments */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-slate-300">
                      Enrolled Courses ({student.enrollments.length})
                    </h3>
                  </div>
                  {student.enrollments.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No enrollments found.</p>
                  ) : (
                    <div className="space-y-2">
                      {student.enrollments.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                        >
                          <div>
                            <p className="text-xs text-slate-400">{e.subject_code}</p>
                            <p className="text-sm text-slate-200">{e.subject_name}</p>
                          </div>
                          <span
                            className={cn(
                              'rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
                              STATUS_STYLES[e.status] ?? 'bg-slate-500/20 text-slate-300'
                            )}
                          >
                            {e.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Student not found.</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
