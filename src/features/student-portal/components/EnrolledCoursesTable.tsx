import { useState } from 'react'
import { EnrollmentWithRelations } from '@/shared/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  UserCheck, 
  Mail, 
  Phone, 
  LayoutGrid, 
  Table as TableIcon, 
  Search, 
  Check, 
  Copy, 
  ExternalLink,
  GraduationCap
} from 'lucide-react'
import { toast } from 'sonner'
import { FacultyContactModal, FacultyInfo } from './FacultyContactModal'

interface EnrolledCoursesTableProps {
  enrollments: EnrollmentWithRelations[]
}

export function EnrolledCoursesTable({ enrollments }: EnrolledCoursesTableProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyInfo | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    toast.success(`${label} copied`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const filteredEnrollments = enrollments.filter((e) => {
    const code = e.subject?.code?.toLowerCase() || ''
    const name = e.subject?.name?.toLowerCase() || ''
    const facultyName = e.subject?.faculty_subjects?.[0]?.faculty?.name?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return code.includes(query) || name.includes(query) || facultyName.includes(query)
  })

  return (
    <>
      <Card className="border border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
        {/* Card Header & Controls */}
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Enrolled Compensatory Courses
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Active courses assigned for attendance & requirement completion
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search subject or faculty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-white border-slate-200 focus-visible:ring-indigo-500"
              />
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-200/60 p-1 rounded-xl gap-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'cards'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No course enrollments found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No subjects matched "${searchQuery}". Try clearing your search.`
                  : 'You have no assigned compensatory courses for this academic term.'}
              </p>
            </div>
          ) : viewMode === 'cards' ? (
            /* Card Grid Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredEnrollments.map((enrollment) => {
                const facultySubject = enrollment.subject?.faculty_subjects?.[0]
                const faculty = facultySubject?.faculty

                return (
                  <div
                    key={enrollment.id}
                    className="group relative bg-white border border-slate-200/80 hover:border-indigo-300/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Course Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          {enrollment.subject?.code || 'N/A'}
                        </span>
                        <Badge
                          variant={enrollment.status === 'completed' ? 'default' : 'secondary'}
                          className={`capitalize text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            enrollment.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {enrollment.status}
                        </Badge>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug mb-4">
                        {enrollment.subject?.name || 'Unspecified Subject'}
                      </h3>

                      {/* Faculty Info Card */}
                      <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-indigo-500" /> Instructor
                          </span>
                          {faculty && (
                            <button
                              onClick={() =>
                                setSelectedFaculty({
                                  name: faculty.name,
                                  email: faculty.email,
                                  phone: faculty.phone,
                                  subjectCode: enrollment.subject?.code || '',
                                  subjectName: enrollment.subject?.name || '',
                                })
                              }
                              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer hover:underline"
                            >
                              Details <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {faculty ? (
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{faculty.name}</p>
                            <div className="flex flex-col gap-1 mt-2 text-xs text-slate-600">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 truncate">
                                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{faculty.email}</span>
                                </span>
                                <button
                                  onClick={() => handleCopy(faculty.email, `Email ${faculty.name}`)}
                                  className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer"
                                  title="Copy Email"
                                >
                                  {copiedField === `Email ${faculty.name}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>

                              {faculty.phone && (
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>{faculty.phone}</span>
                                  </span>
                                  <button
                                    onClick={() => handleCopy(faculty.phone, `Phone ${faculty.name}`)}
                                    className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer"
                                    title="Copy Phone"
                                  >
                                    {copiedField === `Phone ${faculty.name}` ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No faculty assigned yet</p>
                        )}
                      </div>
                    </div>

                    {/* Bottom status trigger */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                        Compensatory Course
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        AY 2025-26
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Dense Table Layout */
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-xl">
              <table className="w-full text-sm text-left text-slate-200">
                <thead className="text-xs text-indigo-300 uppercase bg-slate-950/90 border-b border-slate-800 font-bold tracking-wider">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Code</th>
                    <th scope="col" className="px-5 py-3.5">Subject Name</th>
                    <th scope="col" className="px-5 py-3.5">Status</th>
                    <th scope="col" className="px-5 py-3.5">Assigned Faculty</th>
                    <th scope="col" className="px-5 py-3.5">Contact Email & Phone</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEnrollments.map((enrollment) => {
                    const facultySubject = enrollment.subject?.faculty_subjects?.[0]
                    const faculty = facultySubject?.faculty

                    return (
                      <tr 
                        key={enrollment.id} 
                        className="hover:bg-indigo-900/30 transition-colors"
                      >
                        <td className="px-5 py-4 font-mono font-bold text-indigo-300">
                          {enrollment.subject?.code || 'N/A'}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-100">
                          {enrollment.subject?.name || 'N/A'}
                        </td>
                        <td className="px-5 py-4">
                          <Badge 
                            variant={enrollment.status === 'completed' ? 'default' : 'secondary'}
                            className={`capitalize text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              enrollment.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {enrollment.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-200">
                          {faculty?.name || <span className="text-slate-500 italic">Not Assigned</span>}
                        </td>
                        <td className="px-5 py-4">
                          {faculty ? (
                            <div className="flex flex-col text-xs space-y-1 text-slate-300">
                              <span className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {faculty.email}
                              </span>
                              {faculty.phone && (
                                <span className="flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {faculty.phone}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-xs">N/A</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {faculty && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 rounded-lg cursor-pointer border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                              onClick={() =>
                                setSelectedFaculty({
                                  name: faculty.name,
                                  email: faculty.email,
                                  phone: faculty.phone,
                                  subjectCode: enrollment.subject?.code || '',
                                  subjectName: enrollment.subject?.name || '',
                                })
                              }
                            >
                              Contact Info
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Faculty Modal */}
      <FacultyContactModal
        isOpen={Boolean(selectedFaculty)}
        onClose={() => setSelectedFaculty(null)}
        faculty={selectedFaculty}
      />
    </>
  )
}

