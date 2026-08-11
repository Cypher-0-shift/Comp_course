import { Mail, Phone, User, X, Copy, Check, Building2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export interface FacultyInfo {
  name: string
  email: string
  phone: string
  subjectCode: string
  subjectName: string
  departmentName?: string
  credits?: number
  status?: string
  empId?: string
}

interface FacultyContactModalProps {
  isOpen: boolean
  onClose: () => void
  faculty: FacultyInfo | null
}

export function FacultyContactModal({ isOpen, onClose, faculty }: FacultyContactModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!isOpen || !faculty) return null

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const detailRows: { icon: typeof Mail; label: string; value: string; href?: string; copyKey?: string }[] = [
    { icon: User,     label: 'Name',  value: faculty.name },
    { icon: Mail,     label: 'Email', value: faculty.email, href: `mailto:${faculty.email}`, copyKey: 'Faculty Email' },
    { icon: Phone,    label: 'Phone', value: faculty.phone || 'Not available', copyKey: faculty.phone ? 'Faculty Phone' : undefined },
    ...(faculty.departmentName
      ? [{ icon: Building2, label: 'Department', value: faculty.departmentName }]
      : []),
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ background: 'rgba(15, 23, 42, 0.35)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Faculty details for ${faculty.name}`}
    >
      <div
        className="lg-modal w-full max-w-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header — navy bg */}
        <div className="relative bg-srm-primary px-6 py-5 flex items-start justify-between gap-4">
          <div>
            {/* Course name */}
            <h2 className="text-xl md:text-2xl font-bold text-srm-on-primary leading-snug tracking-tight mb-2.5">
              {faculty.subjectName}
            </h2>

            {/* Course code chip below course name */}
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-xs font-semibold tracking-wider border border-srm-primary-fixed/40 text-srm-primary-fixed bg-srm-primary-dim px-3 py-1 rounded-full">
                Code: {faculty.subjectCode}
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-srm-on-primary transition-colors cursor-pointer shrink-0 mt-0.5"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6">
          {/* Section title */}
          <h3 className="text-xs font-bold text-srm-primary uppercase tracking-wider mb-4">
            ASSIGNED FACULTY DETAILS
          </h3>

          {/* Faculty info glass card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg-card rounded-2xl p-5 border border-white/80 bg-white/70 backdrop-blur-xl shadow-md">
            {detailRows.map((row) => {
              const Icon = row.icon
              return (
                <div key={row.label} className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-srm-primary shrink-0" />
                    {row.label}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    {row.href ? (
                      <a
                        href={row.href}
                        className="text-sm font-bold text-srm-primary underline hover:no-underline break-words-safe min-w-0"
                      >
                        {row.value}
                      </a>
                    ) : (
                      <span className="text-sm font-bold text-slate-900 break-words-safe min-w-0">{row.value}</span>
                    )}
                    {row.copyKey && row.value !== 'Not available' && (
                      <button
                        onClick={() => handleCopy(row.value, row.copyKey!)}
                        className="text-slate-400 hover:text-srm-primary transition-colors cursor-pointer shrink-0 p-1 hover:bg-slate-100/60 rounded-md"
                        title={`Copy ${row.label}`}
                        aria-label={`Copy ${row.label}`}
                      >
                        {copiedField === row.copyKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-6 pb-6 border-t border-white/40 flex justify-end pt-4" style={{ background: 'rgba(255, 255, 255, 0.40)' }}>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl lg-btn-primary text-sm font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
