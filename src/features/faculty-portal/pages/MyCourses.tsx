import { Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFacultyCourses } from '../api/useFacultyCourses'

export function MyCourses() {
  const { data: courses = [], isLoading } = useFacultyCourses()

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#001941] tracking-tight">
          Assigned Courses
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Select a course to view the student roster and manage enrollments.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="lg-card rounded-3xl p-6 h-48 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="lg-card rounded-3xl p-12 text-center text-slate-500 font-medium">
          No courses currently assigned.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <article
              key={course.id}
              className="group lg-card lg-card-hover rounded-3xl overflow-hidden flex flex-col h-full"
            >
              <div className="p-6 flex-grow flex flex-col">
                {/* Course name */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#001941] transition-colors leading-snug mb-1">
                  {course.title}
                </h3>

                {/* Course Code pill — matches student EnrolledCoursesGrid */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-slate-700 bg-white/70 border border-slate-200 px-2.5 py-0.5 rounded-md">
                    Code: {course.code}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200/80 my-3" />

                {/* Stats row — students */}
                <div className="flex flex-col gap-2 mt-auto">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="w-4 h-4 shrink-0 text-[#001941]" />
                    <span className="font-semibold">{course.registeredStudentsCount} Students Enrolled</span>
                  </div>
                </div>
              </div>

              {/* View Details button — matches student card's View Details */}
              <div className="px-6 pb-6">
                <Link
                  to={`/faculty/courses/${course.code.toLowerCase()}/students`}
                  id={`view-details-${course.id}`}
                  className="w-full py-2.5 rounded-xl lg-btn-primary text-sm font-semibold flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#001941] focus:ring-offset-2"
                  aria-label={`View details for ${course.title}`}
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
