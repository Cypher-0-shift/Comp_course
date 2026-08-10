import { useStudentEnrollments } from '../api/useStudentEnrollments'
import { EnrolledCoursesGrid } from '../components/EnrolledCoursesGrid'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MyCourses() {
  const {
    data: enrollments = [],
    isLoading,
    isError,
    refetch,
  } = useStudentEnrollments()

  // ── Loading skeleton ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-40 rounded-xl bg-srm-surface-high" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-srm-surface-high" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-srm-surface-white border border-srm-outline-variant rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-srm-error-container text-srm-error flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-srm-on-surface">Could Not Load Courses</h3>
        <p className="text-sm text-srm-on-surface-muted max-w-sm mt-1 mb-4">
          Unable to load your course enrollment data. Please try again.
        </p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="gap-2 rounded-xl cursor-pointer border-srm-outline-variant text-srm-primary hover:bg-srm-primary-fixed"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="text-xl font-bold text-srm-primary">My Courses</h2>
        <p className="text-sm text-srm-on-surface-muted mt-0.5">
          Your enrolled compensatory courses for the current academic year.
        </p>
      </div>

      {/* Course grid — shows empty state internally if enrollments = [] */}
      <EnrolledCoursesGrid enrollments={enrollments} />
    </div>
  )
}
