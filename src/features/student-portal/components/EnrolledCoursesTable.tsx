import { EnrollmentWithRelations } from '@/shared/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface EnrolledCoursesTableProps {
  enrollments: EnrollmentWithRelations[]
}

export function EnrolledCoursesTable({ enrollments }: EnrolledCoursesTableProps) {
  return (
    <Card>
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-xl text-slate-800">Enrolled Compensatory Courses</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Subject Code</th>
                <th scope="col" className="px-6 py-4 font-semibold">Subject Name</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 font-semibold">Faculty Name</th>
                <th scope="col" className="px-6 py-4 font-semibold">Faculty Contact</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No enrolled compensatory courses found.
                  </td>
                </tr>
              ) : (
                enrollments.map((enrollment) => {
                  const facultySubject = enrollment.subject?.faculty_subjects?.[0]
                  const faculty = facultySubject?.faculty

                  return (
                    <tr 
                      key={enrollment.id} 
                      className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {enrollment.subject?.code || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {enrollment.subject?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={enrollment.status === 'completed' ? 'default' : 'secondary'}
                          className={enrollment.status === 'enrolled' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : ''}
                        >
                          {enrollment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {faculty?.name || 'Not Assigned'}
                      </td>
                      <td className="px-6 py-4">
                        {faculty ? (
                          <div className="flex flex-col text-xs space-y-1 text-slate-500">
                            <span>{faculty.email}</span>
                            <span>{faculty.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">N/A</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// Ensure Badge component exists or create a simple fallback if not
