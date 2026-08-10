import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Search, Users } from 'lucide-react'
import { useCourseRoster } from '../api/useCourseRoster'

export function CourseRoster() {
  const { subjectCode } = useParams<{ subjectCode: string }>()
  const [searchTerm, setSearchTerm] = useState('')

  const displayCode = subjectCode?.toUpperCase() || 'COURSE'
  const { data, isLoading } = useCourseRoster(displayCode, searchTerm)
  const students = data?.students || []
  const courseName = data?.courseName || displayCode

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link 
            to="/faculty/courses"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-srm-primary hover:border-srm-primary hover:bg-srm-primary/5 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold text-[#001941] tracking-tight">{courseName}</h2>
            <p className="text-sm text-slate-500">Manage enrolled students for this subject</p>
          </div>
        </div>
        

      </div>

      {/* Roster Table Container */}
      <div className="lg-table-container overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or register no..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001941] focus:border-transparent transition-shadow placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <Users className="w-4 h-4" />
            <span>Total: {students.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="table-container-safe">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#001941] uppercase bg-slate-50/95 border-b-2 border-slate-200 font-extrabold tracking-wider">
              <tr>
                <th className="px-6 py-4 font-extrabold text-[#001941] uppercase tracking-wider whitespace-nowrap">S.NO</th>
                <th className="px-6 py-4 font-extrabold text-[#001941] uppercase tracking-wider whitespace-nowrap">REGISTER NO</th>
                <th className="px-6 py-4 font-extrabold text-[#001941] uppercase tracking-wider">STUDENT NAME</th>
                <th className="px-6 py-4 font-extrabold text-[#001941] uppercase tracking-wider">PROGRAM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/90">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-4 h-12 bg-slate-50/50" />
                  </tr>
                ))
              ) : students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-normal">{index + 1}</td>
                    <td className="px-6 py-4 font-normal text-slate-700 whitespace-nowrap">{student.registerNo}</td>
                    <td className="px-6 py-4 font-normal text-slate-700 break-words-safe min-w-[160px]">{student.name}</td>
                    <td className="px-6 py-4 font-normal text-slate-700 break-words-safe">{student.program}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No students enrolled in this course yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
