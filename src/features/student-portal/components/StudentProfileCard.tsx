import { useState } from 'react'
import { StudentWithRelations } from '@/shared/types'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone, BookOpen, GraduationCap, IdCard, Copy, Check, Sparkles, Building2 } from 'lucide-react'
import { toast } from 'sonner'

interface StudentProfileCardProps {
  student: StudentWithRelations
}

export function StudentProfileCard({ student }: StudentProfileCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const initials = student.name
    ? student.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'ST'

  return (
    <Card className="relative overflow-hidden border border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
      {/* Decorative top accent line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600" />
      
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          {/* Main Identity Banner */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-4 ring-white">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white" title="Active Enrollment Status">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {student.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  <GraduationCap className="w-3 h-3" />
                  {student.program}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{student.department?.name || 'Department of Computer Science'}</span>
                {student.department?.code && (
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[11px] font-mono font-medium">
                    {student.department.code}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Register Number Pill */}
          <div className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <IdCard className="w-4 h-4 text-indigo-600" />
              <div className="text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Register No.</p>
                <p className="text-sm font-mono font-bold text-slate-900">{student.register_no}</p>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(student.register_no, 'Register Number')}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              title="Copy Register Number"
            >
              {copiedField === 'Register Number' ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
          {/* Register No Field */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <IdCard className="w-3.5 h-3.5 text-indigo-500" /> Register ID
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 font-mono">{student.register_no}</p>
          </div>

          {/* Email Address */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email Address
              </span>
              <button
                onClick={() => copyToClipboard(student.email, 'Email Address')}
                className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                title="Copy Email"
              >
                {copiedField === 'Email Address' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-900 truncate" title={student.email}>
              {student.email}
            </p>
          </div>

          {/* Mobile Contact */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-500" /> Mobile Contact
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {student.mobile || 'Not Specified'}
            </p>
          </div>

          {/* Program Degree */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Academic Degree
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{student.program}</p>
          </div>

          {/* Department Name */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all sm:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Assigned Department
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {student.department?.name || 'Computer Science and Engineering'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

