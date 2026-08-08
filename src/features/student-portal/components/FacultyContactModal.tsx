import { Mail, Phone, UserCheck, X, Copy, Check, Building2, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export interface FacultyInfo {
  name: string
  email: string
  phone: string
  subjectCode: string
  subjectName: string
  departmentName?: string
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

  const initials = faculty.name
    ? faculty.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'FC'

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Background */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white text-indigo-700 font-extrabold text-xl flex items-center justify-center shadow-lg ring-4 ring-white/20">
              {initials}
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100/20 text-indigo-100 backdrop-blur-xs border border-indigo-200/30">
                <UserCheck className="w-3 h-3 text-emerald-300" />
                Assigned Faculty
              </span>
              <h3 className="text-lg font-bold tracking-tight text-white mt-0.5">{faculty.name}</h3>
              <p className="text-xs text-indigo-100/90 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> {faculty.subjectCode} — {faculty.subjectName}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {/* Email item */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Email Address</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{faculty.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-slate-500 hover:text-indigo-600 cursor-pointer"
                onClick={() => handleCopy(faculty.email, 'Faculty Email')}
              >
                {copiedField === 'Faculty Email' ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Phone item */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Phone Number</p>
                  <p className="text-sm font-semibold text-slate-900">{faculty.phone || 'Not available'}</p>
                </div>
              </div>
              {faculty.phone && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-slate-500 hover:text-indigo-600 cursor-pointer"
                  onClick={() => handleCopy(faculty.phone, 'Faculty Phone')}
                >
                  {copiedField === 'Faculty Phone' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>

            {/* Department item */}
            {faculty.departmentName && (
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Department</p>
                  <p className="text-sm font-semibold text-slate-900">{faculty.departmentName}</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl h-10 transition-colors cursor-pointer"
              onClick={onClose}
            >
              Close Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
