import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StudentWithRelations } from '@/shared/types'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface StudentProfileCardProps {
  student: StudentWithRelations
  registeredCount?: number
  completedCount?: number
}

function parseDegreeAndCourse(programString?: string) {
  if (!programString) {
    return { degree: '—', course: '—' }
  }

  const raw = programString.trim()
  let degree = ''
  let course = ''

  if (raw.includes('.-')) {
    const parts = raw.split('.-')
    degree = parts[0].trim()
    course = parts.slice(1).join('.-').trim()
  } else if (raw.includes(' - ')) {
    const parts = raw.split(' - ')
    degree = parts[0].trim()
    course = parts.slice(1).join(' - ').trim()
  } else if (raw.includes('-')) {
    const parts = raw.split('-')
    degree = parts[0].trim()
    course = parts.slice(1).join('-').trim()
  } else {
    degree = raw
    course = '—'
  }

  if (degree.endsWith('.')) {
    degree = degree.slice(0, -1)
  }

  return {
    degree: degree || '—',
    course: course || '—',
  }
}

export function StudentProfileCard({
  student,
  registeredCount = 0,
  completedCount: _completedCount = 0,
}: StudentProfileCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { degree, course } = parseDegreeAndCourse(student.program)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const initials = student.name
    ? student.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'ST'


  return (
    <div className="lg-card lg-card-hover rounded-3xl p-6 md:p-8">

      <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        {/* Avatar circle */}
        <div className="shrink-0">
          <div
            className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white/80 shadow-md flex items-center justify-center text-white font-extrabold text-2xl md:text-3xl bg-gradient-to-br from-[#001941] to-[#0b2e63]"
            aria-label={`${student.name} profile avatar`}
          >
            {initials}
          </div>
        </div>

        {/* Info section */}
        <div className="flex-1 text-center md:text-left min-w-0">
          {/* Name */}
          <h1 className="text-2xl md:text-3xl font-bold text-srm-primary mb-4 leading-tight tracking-tight break-words-safe">
            {student.name}
          </h1>

          {/* 2-column info structure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-4 mb-6">
            {/* Column 1: Registration No & Contact Details (Email, Phone) under Name */}
            <div className="flex flex-col space-y-3 min-w-0 text-left">
              {/* Registration No */}
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  Registration No
                </span>
                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                  <span className="text-sm font-semibold text-slate-800 break-words-safe flex-text-child min-w-0">
                    {student.register_no}
                  </span>
                  {student.register_no && (
                    <button
                      onClick={() => copyToClipboard(student.register_no, 'Register No')}
                      className="text-slate-400 hover:text-srm-primary transition-colors cursor-pointer shrink-0"
                      title="Copy Registration No"
                      aria-label="Copy Registration No"
                    >
                      {copiedField === 'Register No' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  Email
                </span>
                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                  <span className="text-sm font-semibold text-slate-800 break-words-safe flex-text-child min-w-0">
                    {student.email}
                  </span>
                  {student.email && (
                    <button
                      onClick={() => copyToClipboard(student.email, 'Email')}
                      className="text-slate-400 hover:text-srm-primary transition-colors cursor-pointer shrink-0"
                      title="Copy Email"
                      aria-label="Copy Email"
                    >
                      {copiedField === 'Email' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  Phone
                </span>
                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                  <span className="text-sm font-semibold text-slate-800 break-words-safe flex-text-child min-w-0">
                    {student.mobile || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Degree, Course, Dept */}
            <div className="flex flex-col space-y-3 min-w-0 text-left">
              {/* Degree */}
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  Degree
                </span>
                <span className="text-sm font-semibold text-slate-800 break-words-safe mt-0.5">
                  {degree}
                </span>
              </div>

              {/* Course */}
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  Course
                </span>
                <span className="text-sm font-semibold text-slate-800 break-words-safe mt-0.5">
                  {course}
                </span>
              </div>

              {/* Dept */}
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  Dept
                </span>
                <span className="text-sm font-semibold text-slate-800 break-words-safe mt-0.5">
                  {student.department?.name || 'Computer Science & Engineering'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats badges section — Clickable Links to My Courses */}
          <div className="pt-6 border-t border-white/50 flex flex-wrap justify-center md:justify-start gap-3">
            {/* Registered courses badge */}
            <Link
              to="/student/courses"
              title="View Registered Courses"
              className="flex items-center gap-3 lg-pill-slate px-5 py-2.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
            >
              <svg className="w-5 h-5 text-srm-primary group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold group-hover:text-srm-primary transition-colors">Registered</span>
                <span className="text-sm font-bold text-slate-900 group-hover:text-srm-primary transition-colors">
                  {registeredCount} {registeredCount === 1 ? 'Course' : 'Courses'}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
