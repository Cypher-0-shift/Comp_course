import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Search, Download, Users } from 'lucide-react'

// Mock Data
const MOCK_STUDENTS = [
  { id: '1', registerNo: 'RA2211003010001', name: 'Aarav Patel', program: 'B.Tech CSE', email: 'aarav.p@srmist.edu.in', status: 'Registered' },
  { id: '2', registerNo: 'RA2211003010002', name: 'Diya Sharma', program: 'B.Tech CSE', email: 'diya.s@srmist.edu.in', status: 'Completed' },
  { id: '3', registerNo: 'RA2211003010003', name: 'Rohan Kumar', program: 'B.Tech CSE', email: 'rohan.k@srmist.edu.in', status: 'Registered' },
  { id: '4', registerNo: 'RA2211003010004', name: 'Ananya Singh', program: 'B.Tech CSE', email: 'ananya.s@srmist.edu.in', status: 'Registered' },
]

export function CourseRoster() {
  const { subjectCode } = useParams<{ subjectCode: string }>()
  const [searchTerm, setSearchTerm] = useState('')

  const displayCode = subjectCode?.toUpperCase() || 'COURSE'

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.registerNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <h2 className="text-2xl font-extrabold text-[#001941] tracking-tight">{displayCode} Roster</h2>
            <p className="text-sm text-slate-500">Manage enrolled students for this subject</p>
          </div>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all active:scale-95">
          <Download className="w-4 h-4" />
          Export List
        </button>
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
            <span>Total: {MOCK_STUDENTS.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="table-container-safe">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">S.No</th>
                <th className="px-6 py-4 whitespace-nowrap">Register No</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Program</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">{student.registerNo}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 break-words-safe min-w-[160px]">{student.name}</td>
                    <td className="px-6 py-4 text-slate-600 break-words-safe">{student.program}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        student.status === 'Completed' 
                          ? 'bg-[#fed65b] text-amber-900 border border-amber-300' 
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No students found matching your search.
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
