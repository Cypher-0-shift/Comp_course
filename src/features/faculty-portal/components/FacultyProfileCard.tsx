import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Check, Users, BookOpen } from 'lucide-react'
import { toast } from 'sonner'

export interface FacultyProfile {
  name: string
  emp_id: string
  department: string
  email: string
  mobile: string
}

interface FacultyProfileCardProps {
  faculty: FacultyProfile
  coursesAssigned?: number
  studentsRegistered?: number
}

export function FacultyProfileCard({
  faculty,
}: FacultyProfileCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const initials = faculty.name
    ? faculty.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'FA'

  return (
    <div className="lg-card lg-card-hover rounded-3xl p-5 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-full border-2 border-white/80 shadow-md flex items-center justify-center text-white font-extrabold text-xl bg-gradient-to-br from-[#001941] to-[#0b2e63] shrink-0"
          aria-label={`${faculty.name} profile avatar`}
        >
          {initials}
        </div>

        {/* Info section */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-srm-primary leading-tight tracking-tight mb-3 break-words-safe">
            {faculty.name}
          </h1>

          {/* Clean, spacious metadata chips — no truncation or trailing dots */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 bg-white/50 border border-white/70 px-3 py-1.5 rounded-xl shadow-2xs min-w-0">
              <span className="text-[10px] uppercase font-extrabold text-slate-500 shrink-0">ID:</span>
              <span className="font-semibold text-slate-900 break-words-safe">{faculty.emp_id}</span>
              <button
                onClick={() => copyToClipboard(faculty.emp_id, 'Employee ID')}
                className="text-slate-400 hover:text-srm-primary transition-colors cursor-pointer ml-0.5 shrink-0"
                title="Copy ID"
              >
                {copiedField === 'Employee ID' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </span>

            <span className="inline-flex items-center gap-1.5 bg-white/50 border border-white/70 px-3 py-1.5 rounded-xl shadow-2xs min-w-0">
              <span className="text-[10px] uppercase font-extrabold text-slate-500 shrink-0">DEPT:</span>
              <span className="font-semibold text-slate-900 break-words-safe">{faculty.department}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 bg-white/50 border border-white/70 px-3 py-1.5 rounded-xl shadow-2xs min-w-0">
              <span className="text-[10px] uppercase font-extrabold text-slate-500 shrink-0">EMAIL:</span>
              <span className="font-semibold text-slate-900 break-words-safe">{faculty.email}</span>
              <button
                onClick={() => copyToClipboard(faculty.email, 'Email')}
                className="text-slate-400 hover:text-srm-primary transition-colors cursor-pointer ml-0.5 shrink-0"
                title="Copy Email"
              >
                {copiedField === 'Email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </span>

            {faculty.mobile && (
              <span className="inline-flex items-center gap-1.5 bg-white/50 border border-white/70 px-3 py-1.5 rounded-xl shadow-2xs min-w-0">
                <span className="text-[10px] uppercase font-extrabold text-slate-500 shrink-0">PHONE:</span>
                <span className="font-semibold text-slate-900 break-words-safe">{faculty.mobile}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
