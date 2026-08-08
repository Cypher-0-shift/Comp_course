import { useEffect, useState } from 'react'
import { StudentWithRelations, EnrollmentWithRelations } from '@/shared/types'
import { getStudentProfile, getStudentEnrollments } from '../api/student'
import { StudentProfileCard } from '../components/StudentProfileCard'
import { EnrolledCoursesTable } from '../components/EnrolledCoursesTable'
import { BookOpen, CheckCircle2, Clock, Sparkles, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function StudentDashboard() {
  const [profile, setProfile] = useState<StudentWithRelations | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = () => {
    setLoading(true)
    setError(null)
    Promise.all([getStudentProfile(), getStudentEnrollments()])
      .then(([profileData, enrollmentsData]) => {
        setProfile(profileData)
        setEnrollments(enrollmentsData)
      })
      .catch((err) => {
        console.error('Failed to load student data', err)
        setError('Unable to load student profile information.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Skeleton Banner */}
        <div className="h-28 rounded-2xl bg-slate-200/80" />
        {/* Skeleton Profile Card */}
        <div className="h-64 rounded-2xl bg-slate-200/70" />
        {/* Skeleton Courses Table */}
        <div className="h-80 rounded-2xl bg-slate-200/60" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Student Profile Not Found</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-4">
          {error || 'Could not locate active enrollment profile records.'}
        </p>
        <Button onClick={loadData} variant="outline" className="gap-2 rounded-xl cursor-pointer">
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
      </div>
    )
  }

  const completedCount = enrollments.filter((e) => e.status === 'completed').length
  const activeCount = enrollments.filter((e) => e.status === 'enrolled' || e.status !== 'completed').length
  const firstName = profile.name.split(' ')[0]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Welcome Banner & Overview Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/10 border border-slate-800">
        {/* Ambient Overlay Patterns */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Academic Year 2025–2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-sm text-indigo-200/80 max-w-xl">
              Track your compensatory course enrollments, assigned department instructors, and requirements.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white">
              <div className="flex items-center gap-1.5 text-xs text-indigo-200 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-300" /> Total Enrolled
              </div>
              <p className="text-xl font-extrabold tracking-tight">{enrollments.length}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white">
              <div className="flex items-center gap-1.5 text-xs text-amber-200 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-300" /> In Progress
              </div>
              <p className="text-xl font-extrabold tracking-tight">{activeCount}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Completed
              </div>
              <p className="text-xl font-extrabold tracking-tight">{completedCount}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Student Profile Card Component */}
      <StudentProfileCard student={profile} />

      {/* Enrolled Courses Table Component */}
      <EnrolledCoursesTable enrollments={enrollments} />
    </div>
  )
}

