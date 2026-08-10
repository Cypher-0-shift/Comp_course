import { useStudentProfile } from '../api/useStudentProfile'
import { useStudentEnrollments } from '../api/useStudentEnrollments'
import { StudentProfileCard } from '../components/StudentProfileCard'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function StudentDashboard() {
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useStudentProfile()

  const {
    data: enrollments = [],
    isLoading: enrollmentsLoading,
    refetch: refetchEnrollments,
  } = useStudentEnrollments()

  const isLoading = profileLoading || enrollmentsLoading

  const refetchAll = () => {
    refetchProfile()
    refetchEnrollments()
  }

  // ── Loading skeleton ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-srm-surface-high" />
        <div className="h-64 rounded-2xl bg-srm-surface-high" />
      </div>
    )
  }

  // ── Error / no profile state ───────────────────────────────────────────
  if (profileError || !profile) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-srm-surface-white border border-srm-outline-variant rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-srm-error-container text-srm-error flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-srm-on-surface">Student Profile Not Found</h3>
        <p className="text-sm text-srm-on-surface-muted max-w-sm mt-1 mb-4">
          Could not locate your enrollment profile. Please ensure your account is set up correctly.
        </p>
        <Button
          onClick={refetchAll}
          variant="outline"
          className="gap-2 rounded-xl cursor-pointer border-srm-outline-variant text-srm-primary hover:bg-srm-primary-fixed"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
      </div>
    )
  }

  const completedCount = enrollments.filter((e) => e.status === 'completed').length
  const registeredCount = enrollments.length

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold text-srm-primary tracking-tight">Dashboard</h2>
      </div>

      {/* Student Profile Card */}
      <StudentProfileCard
        student={profile}
        registeredCount={registeredCount}
        completedCount={completedCount}
      />
    </div>
  )
}
