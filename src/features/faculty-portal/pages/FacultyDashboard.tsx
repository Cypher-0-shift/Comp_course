import { useState } from 'react'
import { FacultyProfileCard, type FacultyProfile } from '../components/FacultyProfileCard'
import { Users, BookOpen, PieChart as PieIcon, BarChart2 } from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from 'recharts'

import { useFacultyProfile } from '../api/useFacultyProfile'
import { useFacultyCourses } from '../api/useFacultyCourses'

// Vibrant VIBGYOR Palette: Violet, Indigo/Blue, Cyan, Emerald, Amber, Orange, Rose
const VIBGYOR_COLORS = ['#6366f1', '#06b6d4', '#f97316', '#10b981', '#ec4899', '#8b5cf6']

// Custom pointer tooltip speech bubble targeting hovered slice or bar
interface CustomTooltipProps {
  active?: boolean
  payload?: readonly any[]
  totalStudents?: number
}

function CustomPointerTooltip({ active, payload, totalStudents = 142 }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]
  const color = data.color || data.payload?.fill || '#6366f1'
  const name = data.payload?.name || data.payload?.course || data.name
  const value = data.value || data.payload?.registered
  const percentage = ((value / totalStudents) * 100).toFixed(0)

  return (
    <div className="relative pointer-events-none z-50 transition-all duration-200 ease-out animate-in fade-in-50 zoom-in-95">
      {/* Speech-bubble liquid glass card */}
      <div
        className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-2xl px-4 py-3 shadow-2xl flex flex-col gap-1.5 min-w-[190px] border-b-4"
        style={{ borderBottomColor: color }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-bold text-slate-900 leading-snug">
            {name}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100/90">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Registered:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-slate-900">
              {value}
            </span>
            <span
              className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md"
              style={{ backgroundColor: `${color}18`, color: color }}
            >
              {percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Target arrow caret pointing down to hovered segment */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div
          className="w-0 h-0 border-x-[7px] border-x-transparent border-t-[8px]"
          style={{ borderTopColor: color }}
        />
      </div>
    </div>
  )
}

const RADIAN = Math.PI / 180

function splitTextIntoLines(text: string, maxCharsPerLine = 25): string[] {
  if (text.length <= maxCharsPerLine) return [text]
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine || !currentLine) {
      currentLine = (currentLine + ' ' + word).trim()
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

// PowerPoint style Leader Line & Data Label renderer supporting full multiline text
const renderPowerPointCustomLabel = (
  props: any,
  _activeDataId: string | null,
  _onSetActive: (id: string | null) => void
) => {
  const { cx = 150, cy = 150, midAngle = 0, outerRadius = 105, name = '', value = 0, percent = 0, index = 0, payload } = props
  const itemId = payload?.id || payload?.name || name || `item-${index}`

  const color = VIBGYOR_COLORS[index % VIBGYOR_COLORS.length] || '#6366f1'
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const isRightSide = cos >= 0

  // 1. Leader Line Exit point from outer radius of slice
  const sx = cx + (Number(outerRadius) + 4) * cos
  const sy = cy + (Number(outerRadius) + 4) * sin

  // 2. Knee / elbow inflection point (diagonal elbow line)
  const mx = cx + (Number(outerRadius) + 14) * cos
  const my = cy + (Number(outerRadius) + 14) * sin

  // 3. Horizontal extension segment towards text
  const ex = mx + (isRightSide ? 10 : -10)
  const ey = my

  // 4. Text Anchor Position & Multiline line calculation
  const textX = ex + (isRightSide ? 6 : -6)
  const percentText = `${(percent * 100).toFixed(0)}%`
  const nameLines = splitTextIntoLines(name, 24)
  const lineSpacing = 14
  const startY = ey - ((nameLines.length - 1) * lineSpacing) / 2 - 8

  return (
    <g
      id={`pie-label-group-${itemId}`}
      aria-label={`${name}: ${value} Students (${percentText})`}
      className="select-none outline-none"
    >
      {/* Crisp Leader Line Path */}
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Target Anchor Dot on slice perimeter */}
      <circle cx={sx} cy={sy} r={3.5} fill={color} />

      {/* Multiline Full Course Name */}
      {nameLines.map((line, idx) => (
        <text
          key={idx}
          x={textX}
          y={startY + idx * lineSpacing}
          textAnchor={isRightSide ? 'start' : 'end'}
          dominantBaseline="central"
          fill="#0f172a"
          style={{ fontSize: '12px', fontWeight: 700 }}
        >
          {line}
        </text>
      ))}

      {/* Value & Percentage Line */}
      <text
        x={textX}
        y={startY + nameLines.length * lineSpacing + 2}
        textAnchor={isRightSide ? 'start' : 'end'}
        dominantBaseline="central"
        fill={color}
        style={{ fontSize: '12px', fontWeight: 800 }}
      >
        {value} Students ({percentText})
      </text>
    </g>
  )
}

export function FacultyDashboard() {
  const [activeDataId, setActiveDataId] = useState<string | null>(null)
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null)

  const profileQuery = useFacultyProfile()
  const coursesQuery = useFacultyCourses()

  const facultyProfile: FacultyProfile = profileQuery.data || {
    name: 'Dr. Faculty Member',
    emp_id: 'EMP1001',
    department: 'Computer Science & Engineering',
    email: 'faculty@srmist.edu.in',
    mobile: '+91 9876543210',
  }

  const assignedCourses = coursesQuery.data || []
  const totalCoursesAssigned = assignedCourses.length
  const totalStudentsRegistered = assignedCourses.reduce(
    (sum, item) => sum + item.registeredStudentsCount,
    0
  )

  const courseDistribution = assignedCourses.map((c) => ({
    id: c.code,
    name: `${c.title} (${c.code})`,
    value: c.registeredStudentsCount,
  }))

  const registrationStats = assignedCourses.map((c) => ({
    course: c.code,
    name: c.title,
    registered: c.registeredStudentsCount,
    capacity: c.totalCapacity,
  }))

  return (
    <div className="space-y-6 md:space-y-8 relative pb-10">
      {/* Page heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#001941] tracking-tight">
          Faculty Dashboard
        </h2>
      </div>

      {/* 1. Compact Profile Card */}
      <FacultyProfileCard faculty={facultyProfile} />

      {/* 2. Analytics 2-Stat Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {[
          { title: 'Courses Assigned', value: String(totalCoursesAssigned), icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Total Students Registered', value: String(totalStudentsRegistered), icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50' },
        ].map((stat) => (
          <div key={stat.title} className="lg-card lg-card-hover rounded-3xl p-5 flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1">{stat.title}</p>
              <h4 className="text-2xl font-extrabold text-slate-900">{stat.value}</h4>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Full-Width Pie Chart Card */}
      <div className="lg-card rounded-3xl p-5 md:p-6 flex flex-col justify-between w-full">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base md:text-lg flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-600" />
              Course Enrollment Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribution of {totalStudentsRegistered} students registered across {totalCoursesAssigned} assigned courses
            </p>
          </div>
        </div>

        <div className="h-[420px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 25, right: 220, bottom: 25, left: 220 }}>
              <Pie
                data={courseDistribution.length > 0 ? courseDistribution : [{ id: 'none', name: 'No Courses', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={5}
                dataKey="value"
                label={(props) => renderPowerPointCustomLabel(props, null, () => {})}
                labelLine={false}
                isAnimationActive={true}
              >
                {courseDistribution.map((item, index) => {
                  const color = VIBGYOR_COLORS[index % VIBGYOR_COLORS.length]

                  return (
                    <Cell
                      key={`cell-${item.id}`}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  )
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Side-by-Side 2-Column Grid: Bar Graph (Left) & Assigned Courses Breakdown (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Multi-color VIBGYOR Bar Chart */}
        <div className="lg-card rounded-3xl p-5 md:p-6 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base md:text-lg flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-cyan-600" />
                Students per Course
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Students registered in each course assigned to faculty</p>
            </div>
          </div>

          <div className="h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationStats} margin={{ top: 25, right: 20, left: -10, bottom: 20 }}>
                <XAxis dataKey="course" tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 700 }} />
                <YAxis
                  allowDecimals={false}
                  domain={[0, (dataMax: number) => Math.max(dataMax + 1, 5)]}
                  tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 25, 65, 0.04)' }}
                  content={(props) => <CustomPointerTooltip {...props} totalStudents={totalStudentsRegistered} />}
                />
                <Bar
                  dataKey="registered"
                  name="Students Registered"
                  radius={[10, 10, 0, 0]}
                  onMouseEnter={(_, index) => setActiveBarIndex(index)}
                  onMouseLeave={() => setActiveBarIndex(null)}
                  animationDuration={600}
                >
                  <LabelList dataKey="registered" position="top" fill="#001941" fontSize={12} fontWeight={700} offset={8} />
                  {registrationStats.map((_, index) => {
                    const isAnyHovered = activeBarIndex !== null
                    const isCurrentHovered = activeBarIndex === index
                    const barOpacity = isAnyHovered ? (isCurrentHovered ? 1.0 : 0.25) : 1.0
                    const color = VIBGYOR_COLORS[index % VIBGYOR_COLORS.length]

                    return (
                      <Cell
                        key={`bar-cell-${index}`}
                        fill={color}
                        className="cursor-pointer transition-opacity duration-200"
                        style={{
                          opacity: barOpacity,
                        }}
                      />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Dedicated Assigned Course Breakdown Card with Focus Isolation Sync */}
        <div className="lg-card rounded-3xl p-5 md:p-6 flex flex-col h-[420px] overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Proper Fixed Header with Badge & Divider */}
            <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-200/80 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base md:text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
                  Assigned Courses Breakdown
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Breakdown of students registered for assigned courses</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                {courseDistribution.length} {courseDistribution.length === 1 ? 'Course' : 'Courses'}
              </span>
            </div>

            {/* Scrollable Container with Custom Scrollbar */}
            <div className="flex-1 overflow-y-auto pr-1.5 space-y-2.5 custom-scrollbar">
              {courseDistribution.map((item, index) => {
                const percentage = totalStudentsRegistered > 0
                  ? ((item.value / totalStudentsRegistered) * 100).toFixed(0)
                  : '0'
                const color = VIBGYOR_COLORS[index % VIBGYOR_COLORS.length]
                const isActive = activeDataId === item.id
                const isDimmed = activeDataId !== null && !isActive
                const cardOpacity = isDimmed ? 0.25 : 1.0

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setActiveDataId(item.id)}
                    onMouseLeave={() => setActiveDataId(null)}
                    onFocus={() => setActiveDataId(item.id)}
                    onBlur={() => setActiveDataId(null)}
                    tabIndex={0}
                    className="lg-card-hover rounded-2xl p-3.5 border border-white/80 bg-white/50 backdrop-blur-md flex items-center justify-between gap-3 shadow-2xs transition-opacity duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    style={{
                      opacity: cardOpacity,
                      borderColor: isActive ? color : 'rgba(255,255,255,0.8)',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: color }}
                      />
                      <h4 className="font-bold text-slate-900 text-sm truncate">
                        {item.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold text-slate-600">
                        <strong className="text-slate-900 font-extrabold text-sm">{item.value}</strong> Students
                      </span>
                      <span
                        className="text-xs font-extrabold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: `${color}15`, color: color }}
                      >
                        {percentage}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
