import { useState } from 'react'
import { EnrollmentWithRelations } from '@/shared/types'
import { BookOpen, User } from 'lucide-react'
import { FacultyContactModal, FacultyInfo } from './FacultyContactModal'

interface EnrolledCoursesGridProps {
  enrollments: EnrollmentWithRelations[]
}

export function EnrolledCoursesGrid({ enrollments }: EnrolledCoursesGridProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyInfo | null>(null)

  const openModal = (enrollment: EnrollmentWithRelations) => {
    const facultySubject = enrollment.subject?.faculty_subjects?.[0]
    const faculty = facultySubject?.faculty
    if (!faculty) return
    const credits = enrollment.subject?.credits ?? 0
    setSelectedFaculty({
      name: faculty.name,
      email: faculty.email,
      phone: faculty.phone,
      subjectCode: enrollment.subject?.code || '',
      subjectName: enrollment.subject?.name || '',
      credits: credits,
      status: enrollment.status || 'registered',
      departmentName: faculty.department_id,
      empId: faculty.emp_id,
    })
  }

  // ── Empty state ────────────────────────────────────────────────────────
  if (enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-srm-outline-variant rounded-2xl text-center">
        <div className="w-12 h-12 rounded-full bg-srm-primary-fixed flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-srm-primary" />
        </div>
        <h3 className="text-base font-semibold text-srm-on-surface mb-1">No courses found</h3>
        <p className="text-sm text-srm-on-surface-muted max-w-xs">
          You have no assigned compensatory courses for this academic term.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Course card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enrollment) => {
          const facultySubject = enrollment.subject?.faculty_subjects?.[0]
          const faculty = facultySubject?.faculty
          const courseCode = enrollment.subject?.code || 'N/A'
          const courseName = enrollment.subject?.name || 'Unspecified Subject'
          const facultyName = faculty?.name

          return (
            <article
              key={enrollment.id}
              className="group lg-card lg-card-hover rounded-3xl overflow-hidden flex flex-col h-full"
            >
              <div className="p-6 flex-grow flex flex-col">



                {/* Course name */}
                <h3 className="text-base font-bold text-srm-on-surface group-hover:text-srm-primary transition-colors leading-snug mb-1">
                  {courseName}
                </h3>

                {/* Course Code below Course Name */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-slate-700 bg-white/70 border border-slate-200 px-2.5 py-0.5 rounded-md">
                    Code: {courseCode}
                  </span>
                </div>

                {/* Faculty */}
                {facultyName && (
                  <div className="flex items-center gap-2 text-sm text-srm-on-surface-muted mt-auto pt-3.5 border-t-2 border-black/40">
                    <User className="w-4 h-4 shrink-0 text-srm-primary" />
                    <span className="font-semibold text-slate-900">{facultyName}</span>
                  </div>
                )}
              </div>

              {/* View Details button */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => openModal(enrollment)}
                  disabled={!faculty}
                  id={`view-details-${enrollment.id}`}
                  className="w-full py-2.5 rounded-xl lg-btn-primary text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label={`View details for ${courseName}`}
                >
                  View Details
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* Faculty details modal */}
      <FacultyContactModal
        isOpen={Boolean(selectedFaculty)}
        onClose={() => setSelectedFaculty(null)}
        faculty={selectedFaculty}
      />
    </>
  )
}
