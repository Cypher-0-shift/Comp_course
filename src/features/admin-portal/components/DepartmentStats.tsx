import { Building2, BookOpen, GraduationCap, Users } from 'lucide-react'

interface DepartmentStatsProps {
  totalDepartments: number
  totalCourses: number
  totalFacultyAssigned: number
  totalEnrolledStudents: number
}

export function DepartmentStats({
  totalDepartments,
  totalCourses,
  totalFacultyAssigned,
  totalEnrolledStudents,
}: DepartmentStatsProps) {
  const metricCards = [
    {
      title: 'Total Departments',
      value: String(totalDepartments),
      icon: Building2,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-[#6366f1]/10',
    },
    {
      title: 'Total Courses',
      value: String(totalCourses),
      icon: BookOpen,
      iconColor: 'text-cyan-600',
      bgColor: 'bg-[#06b6d4]/10',
    },
    {
      title: 'Total Faculty Assigned',
      value: String(totalFacultyAssigned),
      icon: GraduationCap,
      iconColor: 'text-purple-600',
      bgColor: 'bg-[#8b5cf6]/10',
    },
    {
      title: 'Total Enrolled Students',
      value: String(totalEnrolledStudents),
      icon: Users,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-[#10b981]/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {metricCards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="lg-card lg-card-hover rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-2 min-w-0"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-[11px] xl:text-[12px] uppercase tracking-wider font-extrabold text-slate-500 mb-1 whitespace-normal leading-snug">
                {card.title}
              </p>
              <h4 className="text-2xl md:text-3xl font-extrabold text-[#001941] tracking-tight">
                {card.value}
              </h4>
            </div>
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 ${card.bgColor} ${card.iconColor} border border-slate-200/50 shadow-xs`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
