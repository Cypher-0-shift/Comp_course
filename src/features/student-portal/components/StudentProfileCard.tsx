import { StudentWithRelations } from '@/shared/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, BookOpen, GraduationCap, IdCard } from 'lucide-react'

interface StudentProfileCardProps {
  student: StudentWithRelations
}

export function StudentProfileCard({ student }: StudentProfileCardProps) {
  return (
    <Card>
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-xl text-slate-800">Student Profile</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <IdCard className="w-5 h-5 text-indigo-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-500">Register Number</p>
                <p className="text-base font-semibold text-slate-900">{student.register_no}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mt-0.5 text-xs font-bold">
                {student.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Full Name</p>
                <p className="text-base font-semibold text-slate-900">{student.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-indigo-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-500">Program</p>
                <p className="text-base font-semibold text-slate-900">{student.program}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-indigo-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-500">Department</p>
                <p className="text-base font-semibold text-slate-900">
                  {student.department?.name || 'N/A'} ({student.department?.code || ''})
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-indigo-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-500">Email Address</p>
                <p className="text-base font-semibold text-slate-900">{student.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-indigo-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-500">Mobile Number</p>
                <p className="text-base font-semibold text-slate-900">{student.mobile}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
