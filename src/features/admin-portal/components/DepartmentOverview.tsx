import { useState, useMemo, useEffect, useRef } from 'react'
import { useDepartmentOverview } from '../api/useDepartmentOverview'
import { useFacultyList } from '@/features/faculty-dashboard/api/useFacultyList'
import {
  Building2,
  BookOpen,
  GraduationCap,
  Users,
  PieChart as PieIcon,
  BarChart2,
  TrendingUp,
  Filter,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react'
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

// Vibrant VIBGYOR Color Palette for Charts
const VIBGYOR_COLORS = [
  '#6366f1', // Indigo / Violet
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#10b981', // Emerald
  '#ec4899', // Pink / Rose
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#eab308', // Amber
  '#14b8a6', // Teal
  '#f43f5e', // Rose
]

const RADIAN = Math.PI / 180

// PowerPoint style Leader Line & Data Label renderer
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

const renderPowerPointCustomLabel = (
  props: any,
  _activeDataId: string | null,
  _onSetActive: (id: string | null) => void,
  chartData: { id: string; name: string; value: number }[],
  unitLabel: string
) => {
  const { cx = 150, cy = 150, midAngle = 0, outerRadius = 105, name = '', value = 0, percent = 0, index = 0, payload } = props
  const itemId = payload?.id || chartData[index % chartData.length]?.id || name

  const color = VIBGYOR_COLORS[index % VIBGYOR_COLORS.length] || '#6366f1'
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const isRightSide = cos >= 0

  // Leader line exit point
  const sx = cx + (Number(outerRadius) + 4) * cos
  const sy = cy + (Number(outerRadius) + 4) * sin

  // Elbow point
  const mx = cx + (Number(outerRadius) + 14) * cos
  const my = cy + (Number(outerRadius) + 14) * sin

  // Horizontal extension
  const ex = mx + (isRightSide ? 10 : -10)
  const ey = my

  const textX = ex + (isRightSide ? 6 : -6)
  const percentText = `${(percent * 100).toFixed(0)}%`
  const nameLines = splitTextIntoLines(name, 24)
  const lineSpacing = 14
  const startY = ey - ((nameLines.length - 1) * lineSpacing) / 2 - 8

  return (
    <g
      id={`donut-label-group-${itemId}`}
      aria-label={`${name}: ${value} ${unitLabel} (${percentText})`}
      className="select-none outline-none"
    >
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={sx} cy={sy} r={3.5} fill={color} />

      {/* Multiline Full Name */}
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
        {value} {unitLabel} ({percentText})
      </text>
    </g>
  )
}

interface ProgramItem {
  id: string
  code: string
  name: string
  shortName: string
  degree: 'B.Tech' | 'B.Arch' | 'B.Des' | 'Postgraduate'
  students: number
  coursesCount: number
  facultyCount: number
}

// Master Programs Dataset
const MASTER_PROGRAMS: ProgramItem[] = [
  { id: 'CSE',      code: 'CS01', name: 'Computer Science & Engineering',                             shortName: 'B.Tech CSE',           degree: 'B.Tech',       students: 42, coursesCount: 12, facultyCount: 28 },
  { id: 'AIML',     code: 'CS02', name: 'CSE (AI & Machine Learning)',                                 shortName: 'B.Tech AI & ML',       degree: 'B.Tech',       students: 15, coursesCount: 6,  facultyCount: 14 },
  { id: 'CYBER',    code: 'CS03', name: 'CSE (Cyber Security)',                                        shortName: 'B.Tech Cyber Sec',     degree: 'B.Tech',       students: 10, coursesCount: 5,  facultyCount: 10 },
  { id: 'BIGDATA',  code: 'CS04', name: 'CSE (Big Data Analytics)',                                    shortName: 'B.Tech Big Data',      degree: 'B.Tech',       students: 9,  coursesCount: 4,  facultyCount: 8 },
  { id: 'BIOTECH',  code: 'BT01', name: 'Biotechnology',                                               shortName: 'B.Tech Biotech',       degree: 'B.Tech',       students: 9,  coursesCount: 4,  facultyCount: 8 },
  { id: 'BARCH',    code: 'AR01', name: 'Architecture',                                                shortName: 'B.Arch',               degree: 'B.Arch',       students: 8,  coursesCount: 3,  facultyCount: 6 },
  { id: 'ECE',      code: 'EC01', name: 'Electronics & Communication Eng',                             shortName: 'B.Tech ECE',           degree: 'B.Tech',       students: 7,  coursesCount: 4,  facultyCount: 12 },
  { id: 'IT',       code: 'IT01', name: 'Information Technology',                                      shortName: 'B.Tech IT',            degree: 'B.Tech',       students: 7,  coursesCount: 4,  facultyCount: 10 },
  { id: 'CLOUD',    code: 'CS05', name: 'CSE (Cloud Computing)',                                       shortName: 'B.Tech Cloud',         degree: 'B.Tech',       students: 5,  coursesCount: 3,  facultyCount: 6 },
  { id: 'IOT',      code: 'CS06', name: 'CSE (Internet of Things)',                                    shortName: 'B.Tech IoT',           degree: 'B.Tech',       students: 5,  coursesCount: 3,  facultyCount: 6 },
  { id: 'CIVIL',    code: 'CV01', name: 'Civil Engineering',                                           shortName: 'B.Tech Civil',         degree: 'B.Tech',       students: 4,  coursesCount: 2,  facultyCount: 5 },
  { id: 'CSBS',     code: 'CS07', name: 'CS & Business System',                                        shortName: 'B.Tech CSBS',          degree: 'B.Tech',       students: 4,  coursesCount: 2,  facultyCount: 4 },
  { id: 'EEE',      code: 'EE01', name: 'Electrical & Electronics Eng',                                shortName: 'B.Tech EEE',           degree: 'B.Tech',       students: 4,  coursesCount: 2,  facultyCount: 6 },
  { id: 'GAMING',   code: 'CS08', name: 'CSE (Gaming Technology)',                                     shortName: 'B.Tech Gaming',        degree: 'B.Tech',       students: 4,  coursesCount: 2,  facultyCount: 4 },
  { id: 'BDES',     code: 'DS01', name: 'Interior Design',                                             shortName: 'B.Des Interior',       degree: 'B.Des',        students: 2,  coursesCount: 1,  facultyCount: 3 },
  { id: 'MSTRUCT',  code: 'MS01', name: 'Structural Engineering',                                      shortName: 'M.Tech Structural',    degree: 'Postgraduate', students: 2,  coursesCount: 1,  facultyCount: 3 },
  { id: 'MARCH',    code: 'MA01', name: 'Architectural Design',                                        shortName: 'M.Arch Design',        degree: 'Postgraduate', students: 1,  coursesCount: 1,  facultyCount: 2 },
]

const ALL_DEGREES: ('B.Tech' | 'B.Arch' | 'B.Des' | 'Postgraduate')[] = ['B.Tech', 'B.Arch', 'B.Des', 'Postgraduate']
const UG_DEGREES: ('B.Tech' | 'B.Arch' | 'B.Des')[] = ['B.Tech', 'B.Arch', 'B.Des']

export function DepartmentOverview() {
  const { data: rows = [] } = useDepartmentOverview()
  const { data: facultyData } = useFacultyList({ filters: {}, search: '' })

  const [activePieId, setActivePieId] = useState<string | null>(null)
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null)

  // ── View Perspective Toggle State (Student Data vs Faculty Data) ──────────
  const [viewPerspective, setViewPerspective] = useState<'students' | 'faculty'>('students')

  // ── Multi-Select Checkbox View State ──────────────────────────────────────
  const [selectedDegrees, setSelectedDegrees] = useState<string[]>(['B.Tech', 'B.Arch', 'B.Des', 'Postgraduate'])
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])

  const [degreeDropdownOpen, setDegreeDropdownOpen] = useState(false)
  const [programDropdownOpen, setProgramDropdownOpen] = useState(false)

  const degreeContainerRef = useRef<HTMLDivElement | null>(null)
  const programContainerRef = useRef<HTMLDivElement | null>(null)

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (degreeContainerRef.current && !degreeContainerRef.current.contains(target)) {
        setDegreeDropdownOpen(false)
      }
      if (programContainerRef.current && !programContainerRef.current.contains(target)) {
        setProgramDropdownOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDegreeDropdownOpen(false)
        setProgramDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Helper degree categorizer for live rows
  const getDegreeCategory = (name: string): 'B.Tech' | 'B.Arch' | 'B.Des' | 'Postgraduate' => {
    if (!name) return 'B.Tech'
    if (name.includes('B.Arch')) return 'B.Arch'
    if (name.includes('B.Des')) return 'B.Des'
    if (name.includes('M.Tech') || name.includes('M.Arch')) return 'Postgraduate'
    return 'B.Tech'
  }

  // Helper to clean duplicate degree prefixes (e.g. "B.Tech. - B.Tech.-")
  const getCleanProgramTitle = (name: string): string => {
    if (!name) return ''
    return name
      .replace(/^(B\.Tech\.|B\.Arch\.|B\.Des\.|M\.Tech\.|M\.Arch\.)\s*-?\s*/i, '')
      .replace(/^(B\.Tech|B\.Arch|B\.Des|M\.Tech|M\.Arch)\s*-\s*/i, '')
      .trim()
  }

  // ── Live or Master Dataset Construction ──────────────────────────────────
  const allPrograms: ProgramItem[] = useMemo(() => {
    if (rows.length === 0) return MASTER_PROGRAMS
    return rows.map((r, i) => {
      const degree = getDegreeCategory(r.department_name || r.department_code)
      const cleanTitle = getCleanProgramTitle(r.department_name || r.department_code)
      return {
        id: r.department_code || `DEPT_${i}`,
        code: r.department_code || `D${i}`,
        name: r.department_name || r.department_code,
        shortName: cleanTitle,
        degree: degree,
        students: r.students_registered,
        coursesCount: Math.max(1, Math.round(r.students_registered / 10)),
        facultyCount: Math.max(1, Math.round(r.students_registered / 4)),
      }
    })
  }, [rows])

  // Filtered Programs based on checked Degrees & checked Programs
  const filteredPrograms = useMemo(() => {
    let list = allPrograms

    // Degree Checkbox Filter
    if (selectedDegrees.length > 0) {
      list = list.filter((p) => selectedDegrees.includes(p.degree))
    }

    // Program Checkbox Filter
    if (selectedPrograms.length > 0) {
      list = list.filter((p) => selectedPrograms.includes(p.id))
    }

    return list
  }, [allPrograms, selectedDegrees, selectedPrograms])

  // Available programs for the program checkbox dropdown (belonging to checked degrees)
  const availableProgramsForCheckbox = useMemo(() => {
    if (selectedDegrees.length === 0) return allPrograms
    return allPrograms.filter((p) => selectedDegrees.includes(p.degree))
  }, [allPrograms, selectedDegrees])

  // Grouped available programs by degree category
  const groupedProgramsForCheckbox = useMemo(() => {
    const map = new Map<string, ProgramItem[]>()
    availableProgramsForCheckbox.forEach((p) => {
      if (!map.has(p.degree)) map.set(p.degree, [])
      map.get(p.degree)!.push(p)
    })
    return map
  }, [availableProgramsForCheckbox])

  // Auto-close and reset course dropdown if all degrees get unchecked
  useEffect(() => {
    if (selectedDegrees.length === 0) {
      setProgramDropdownOpen(false)
      setSelectedPrograms([])
    }
  }, [selectedDegrees])

  // Checkbox Toggle Handlers
  const toggleDegree = (degree: string) => {
    setSelectedDegrees((prev) => {
      const next = prev.includes(degree)
        ? prev.filter((d) => d !== degree)
        : [...prev, degree]
      return next
    })
  }

  const toggleUgDegrees = () => {
    const isAllUgChecked = UG_DEGREES.every((d) => selectedDegrees.includes(d))
    if (isAllUgChecked) {
      setSelectedDegrees((prev) => prev.filter((d) => !UG_DEGREES.includes(d as any)))
    } else {
      setSelectedDegrees((prev) => Array.from(new Set([...prev, ...UG_DEGREES])))
    }
  }

  const togglePgDegrees = () => {
    const isPgChecked = selectedDegrees.includes('Postgraduate')
    if (isPgChecked) {
      setSelectedDegrees((prev) => prev.filter((d) => d !== 'Postgraduate'))
    } else {
      setSelectedDegrees((prev) => Array.from(new Set([...prev, 'Postgraduate'])))
    }
  }

  const toggleAllDegrees = () => {
    if (selectedDegrees.length === ALL_DEGREES.length) {
      setSelectedDegrees([])
    } else {
      setSelectedDegrees([...ALL_DEGREES])
    }
  }

  const toggleProgram = (programId: string) => {
    setSelectedPrograms((prev) => {
      return prev.includes(programId)
        ? prev.filter((id) => id !== programId)
        : [...prev, programId]
    })
  }

  const toggleAllPrograms = () => {
    if (selectedPrograms.length === availableProgramsForCheckbox.length) {
      setSelectedPrograms([])
    } else {
      setSelectedPrograms(availableProgramsForCheckbox.map((p) => p.id))
    }
  }

  const resetAllFilters = () => {
    setSelectedDegrees([...ALL_DEGREES])
    setSelectedPrograms([])
  }

  // ── 4 Executive Metrics (Dynamically Recalculated for Perspective & Checkboxes) ──
  const totalDepartments = filteredPrograms.length
  const totalEnrolledStudents = useMemo(() => {
    return filteredPrograms.reduce((sum, p) => sum + p.students, 0)
  }, [filteredPrograms])

  const totalFacultyAssigned = useMemo(() => {
    if (selectedDegrees.length === ALL_DEGREES.length && selectedPrograms.length === 0 && facultyData?.rows.length) {
      return facultyData.rows.length
    }
    return filteredPrograms.reduce((sum, p) => sum + p.facultyCount, 0)
  }, [filteredPrograms, selectedDegrees, selectedPrograms, facultyData])

  const totalCourses = useMemo(() => {
    return filteredPrograms.reduce((sum, p) => sum + p.coursesCount, 0)
  }, [filteredPrograms])

  // ── Dynamic Donut Chart Data (Adjusted for View Perspective) ─────────────
  const chart1Data = useMemo(() => {
    const getItemValue = (p: ProgramItem) => (viewPerspective === 'students' ? p.students : p.facultyCount)

    if (selectedPrograms.length > 0 || selectedDegrees.length <= 1) {
      // Program-level distribution when programs are checked
      return filteredPrograms.map((p) => ({
        id: p.id,
        name: p.shortName || p.name,
        value: getItemValue(p),
      }))
    }

    // Degree-level distribution when multiple degrees checked
    const map = new Map<string, number>()
    filteredPrograms.forEach((p) => {
      map.set(p.degree, (map.get(p.degree) || 0) + getItemValue(p))
    })
    return Array.from(map.entries()).map(([degree, value]) => ({
      id: degree,
      name: degree,
      value: value,
    }))
  }, [filteredPrograms, selectedDegrees, selectedPrograms, viewPerspective])

  // ── Bar Chart Data (Adjusted for View Perspective) ────────────────────────
  const barChartData = useMemo(() => {
    return filteredPrograms.map((p) => ({
      dept: p.code,
      name: p.name,
      registered: viewPerspective === 'students' ? p.students : p.facultyCount,
    }))
  }, [filteredPrograms, viewPerspective])

  const unitLabel = viewPerspective === 'students' ? 'Students' : 'Faculty'

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

  const isFiltered = selectedDegrees.length !== ALL_DEGREES.length || selectedPrograms.length > 0

  return (
    <div className="space-y-6 md:space-y-8 relative pb-10">

      {/* ── 1. Top 4 Executive Metric Cards (Dynamically Recalculated) ────── */}
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

      {/* ── 2. View Options Control Bar (With Student / Faculty Switcher) ───── */}
      <div className="lg-card rounded-3xl p-5 md:p-6 flex flex-col gap-4 relative z-30 overflow-visible">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <Filter className="w-5 h-5 text-[#001941]" />
            <div>
              <h2 className="font-extrabold text-[#001941] text-base md:text-lg">
                View Options
              </h2>
              <p className="text-xs text-slate-500">
                Switch perspective and apply hierarchical multi-select degree & course filters
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Perspective Switcher Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shadow-xs">
              <button
                type="button"
                onClick={() => setViewPerspective('students')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  viewPerspective === 'students'
                    ? 'bg-[#001941] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Student Data
              </button>

              <button
                type="button"
                onClick={() => setViewPerspective('faculty')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  viewPerspective === 'faculty'
                    ? 'bg-[#001941] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Faculty Data
              </button>
            </div>

            {/* Reset Filters Button (Always Visible) */}
            <button
              type="button"
              onClick={resetAllFilters}
              disabled={!isFiltered}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                isFiltered
                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 cursor-pointer shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Multi-Select Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-40">

          {/* Dropdown 1: Degree Level Hierarchy */}
          <div ref={degreeContainerRef} id="degree-multiselect-container" className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#001941]" />
              Select Degrees:
            </label>
            <button
              type="button"
              onClick={() => {
                setDegreeDropdownOpen((v) => !v)
                setProgramDropdownOpen(false)
              }}
              className="lg-pill-slate w-full px-4 py-2.5 text-xs font-bold text-[#001941] bg-white/90 border border-slate-200/90 rounded-xl flex items-center justify-between cursor-pointer shadow-2xs hover:bg-white transition-all"
            >
              <span className="truncate">
                {selectedDegrees.length === ALL_DEGREES.length
                  ? 'All Degrees (UG & PG)'
                  : selectedDegrees.length === 0
                  ? 'No Degrees Selected'
                  : `${selectedDegrees.join(', ')} (${selectedDegrees.length})`}
              </span>
              <ChevronDown className={`w-4 h-4 text-[#001941] shrink-0 transition-transform ${degreeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Attached Dropdown Popup 1 */}
            {degreeDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white border border-slate-300 p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1 max-h-80 overflow-y-auto text-slate-900 font-sans z-50">
                {/* Top Master Toggle: All Degrees (UG & PG) */}
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-extrabold cursor-pointer hover:bg-slate-100 text-[#001941]">
                  <input
                    type="checkbox"
                    checked={selectedDegrees.length === ALL_DEGREES.length}
                    onChange={toggleAllDegrees}
                    className="w-4 h-4 rounded accent-[#001941] cursor-pointer shrink-0"
                  />
                  <span>All Degrees (UG & PG)</span>
                </label>

                <div className="h-px bg-slate-200 my-1" />

                {/* Group 1: Undergraduate (UG Programs) */}
                <div className="space-y-1">
                  <div className="px-2.5 pt-1 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Undergraduate (UG Programs)
                  </div>

                  {/* Sub-toggle: All UG Degrees */}
                  <label className="flex items-center gap-2.5 p-2 pl-4 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={UG_DEGREES.every((d) => selectedDegrees.includes(d))}
                      onChange={toggleUgDegrees}
                      className="w-4 h-4 rounded accent-[#001941] cursor-pointer shrink-0"
                    />
                    <span>All UG Degrees (B.Tech, B.Arch, B.Des)</span>
                  </label>

                  {/* Individual UG Degrees */}
                  {[
                    { id: 'B.Tech', label: 'B.Tech (Bachelor of Technology)' },
                    { id: 'B.Arch', label: 'B.Arch (Bachelor of Architecture)' },
                    { id: 'B.Des',  label: 'B.Des (Bachelor of Design)' },
                  ].map((degItem) => {
                    const isChecked = selectedDegrees.includes(degItem.id)
                    return (
                      <label
                        key={degItem.id}
                        className="flex items-center gap-2.5 p-2 pl-7 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-100 text-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDegree(degItem.id)}
                          className="w-4 h-4 rounded accent-[#001941] cursor-pointer shrink-0"
                        />
                        <span>{degItem.label}</span>
                      </label>
                    )
                  })}
                </div>

                <div className="h-px bg-slate-200 my-1" />

                {/* Group 2: Postgraduate (PG Programs) */}
                <div className="space-y-1">
                  <div className="px-2.5 pt-1 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Postgraduate (PG Programs)
                  </div>

                  {/* PG Degrees Toggle */}
                  <label className="flex items-center gap-2.5 p-2 pl-4 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDegrees.includes('Postgraduate')}
                      onChange={togglePgDegrees}
                      className="w-4 h-4 rounded accent-[#001941] cursor-pointer shrink-0"
                    />
                    <span className="font-bold">All PG Degrees (M.Tech, M.Arch)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Dropdown 2: Course / Specialization Hierarchy (Requires Degree Selection First) */}
          <div ref={programContainerRef} id="program-multiselect-container" className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-bold text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#001941]" />
                Select Course / Specialization:
              </span>
              {selectedDegrees.length === 0 && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Degree Required
                </span>
              )}
            </label>
            <button
              type="button"
              disabled={selectedDegrees.length === 0}
              onClick={() => {
                if (selectedDegrees.length === 0) return
                setProgramDropdownOpen((v) => !v)
                setDegreeDropdownOpen(false)
              }}
              className={`w-full px-4 py-2.5 text-xs font-bold rounded-xl flex items-center justify-between transition-all ${
                selectedDegrees.length === 0
                  ? 'bg-slate-100/90 border border-slate-200/90 text-slate-400 cursor-not-allowed opacity-75'
                  : 'lg-pill-slate text-[#001941] bg-white/90 border border-slate-200/90 cursor-pointer shadow-2xs hover:bg-white'
              }`}
            >
              <span className="truncate">
                {selectedDegrees.length === 0
                  ? '🔒 Select a Degree first above to view courses'
                  : selectedPrograms.length === 0
                  ? `All Courses under Selected Degrees (${availableProgramsForCheckbox.length})`
                  : `${selectedPrograms.length} of ${availableProgramsForCheckbox.length} Selected`}
              </span>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${selectedDegrees.length === 0 ? 'text-slate-300' : 'text-[#001941]'} ${programDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Attached Dropdown Popup 2 (Right Aligned to Expand Leftwards) */}
            {programDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 rounded-2xl bg-white border border-slate-300 p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1 max-h-80 overflow-y-auto text-slate-900 font-sans z-50 min-w-[340px] sm:min-w-[480px]">
                {/* Top Master Toggle: All Courses */}
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-extrabold cursor-pointer hover:bg-slate-100 text-[#001941]">
                  <input
                    type="checkbox"
                    checked={selectedPrograms.length === availableProgramsForCheckbox.length && availableProgramsForCheckbox.length > 0}
                    onChange={toggleAllPrograms}
                    className="w-4 h-4 rounded accent-[#001941] cursor-pointer shrink-0"
                  />
                  <span>All Courses under Selected Degrees</span>
                </label>

                {/* Grouped Courses by Degree Category */}
                {Array.from(groupedProgramsForCheckbox.entries()).map(([degreeGroup, progList]) => (
                  <div key={degreeGroup} className="pt-1">
                    <div className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 rounded-lg mb-1">
                      {degreeGroup} Specializations ({progList.length})
                    </div>
                    {progList.map((p) => {
                      const isChecked = selectedPrograms.includes(p.id)
                      const displayTitle = p.shortName || p.name
                      return (
                        <div key={p.id} className="relative group">
                          <label
                            title={p.name}
                            className="flex items-center justify-between p-2 pl-4 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-100 text-slate-800 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleProgram(p.id)}
                                className="w-4 h-4 rounded accent-[#001941] cursor-pointer shrink-0"
                              />
                              <span className="truncate">{displayTitle}</span>
                            </div>
                          </label>

                          {/* Minimalist Hover Tooltip displaying full course text above row */}
                          <div className="absolute hidden group-hover:block left-6 bottom-full mb-1 z-[120] bg-[#001941] text-white px-3 py-1.5 text-xs font-semibold rounded-xl shadow-2xl max-w-md pointer-events-none leading-relaxed border border-slate-700/90">
                            {displayTitle}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Filter Summary Line */}
        <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Active Mode:{' '}
            <strong className="text-[#001941] font-extrabold uppercase tracking-wide">
              {viewPerspective === 'students' ? 'Student Data' : 'Faculty Data'}
            </strong>
            {' '}• Degrees:{' '}
            <strong className="text-[#001941] font-bold">
              {selectedDegrees.length === ALL_DEGREES.length ? 'All Degrees (UG & PG)' : `${selectedDegrees.join(', ')}`}
            </strong>
            {selectedPrograms.length > 0 ? (
              <>
                {' '}• Courses:{' '}
                <strong className="text-[#001941] font-bold">
                  {selectedPrograms.length} checked
                </strong>
              </>
            ) : (
              ' • All Courses Included'
            )}
          </span>
        </div>
      </div>

      {/* ── 3. Primary Analytics Donut Chart (Dynamic Student vs Faculty Mode) ──── */}
      <div className="lg-card rounded-3xl p-5 md:p-6 flex flex-col justify-between w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-[#001941] text-base md:text-lg flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-600" />
              {viewPerspective === 'students'
                ? selectedPrograms.length > 0 || selectedDegrees.length <= 1
                  ? 'Student Specialization Distribution'
                  : 'Student Academic Program Overview'
                : selectedPrograms.length > 0 || selectedDegrees.length <= 1
                  ? 'Faculty Specialization Allocation'
                  : 'Faculty Academic Program Overview'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribution of{' '}
              <strong className="text-[#001941] font-extrabold">
                {viewPerspective === 'students' ? `${totalEnrolledStudents} enrolled students` : `${totalFacultyAssigned} faculty members`}
              </strong>{' '}
              across {chart1Data.length} active categories
            </p>
          </div>

          <div className="text-xs font-bold text-[#001941] bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80 self-start sm:self-auto">
            Mode: {viewPerspective === 'students' ? '👨‍🎓 Student Data' : '👨‍🏫 Faculty Data'}
          </div>
        </div>

        <div className="h-[360px] w-full pt-2">
          {chart1Data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-400 italic">
              No categories checked. Check degree or course checkboxes above to view distribution.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 25, right: 180, bottom: 25, left: 180 }}>
                <Pie
                  data={chart1Data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={5}
                  dataKey="value"
                  activeShape={false}
                  label={(props) => renderPowerPointCustomLabel(props, activePieId, setActivePieId, chart1Data, unitLabel)}
                  labelLine={false}
                  onMouseEnter={(data: any) => setActivePieId(data?.id || null)}
                  onMouseLeave={() => setActivePieId(null)}
                  isAnimationActive={true}
                >
                  {chart1Data.map((item, index) => {
                    const isActive = activePieId === item.id
                    const isDimmed = activePieId !== null && !isActive
                    const sliceOpacity = isDimmed ? 0.25 : 1.0
                    const color = VIBGYOR_COLORS[index % VIBGYOR_COLORS.length]

                    return (
                      <Cell
                        key={`cell-${item.id}`}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth={isActive ? 3 : 2}
                        className="cursor-pointer transition-opacity duration-200"
                        style={{ opacity: sliceOpacity }}
                        onMouseEnter={() => setActivePieId(item.id)}
                        onMouseLeave={() => setActivePieId(null)}
                      />
                    )
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── 4. Side-by-Side Grid: Bar Chart (Left) & Detailed List (Right) ───── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left: Bar Chart */}
        <div className="lg-card rounded-3xl p-5 md:p-6 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-[#001941] text-base md:text-lg flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-cyan-600" />
                {viewPerspective === 'students' ? 'Students per Program' : 'Faculty Members per Program'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredPrograms.length} active programs ({viewPerspective === 'students' ? 'Student Count' : 'Faculty Count'})
              </p>
            </div>
          </div>

          <div className="h-[340px] w-full pt-2">
            {barChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400 italic">
                No items selected.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 25, right: 20, left: -10, bottom: 20 }}>
                  <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 700 }} />
                  <YAxis
                    allowDecimals={false}
                    domain={[0, (dataMax: number) => Math.max(dataMax + 1, 5)]}
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 25, 65, 0.04)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-xl bg-[#001941] p-3 shadow-xl text-white text-xs space-y-1">
                            <p className="font-bold border-b border-white/20 pb-1">{data.fullName || data.dept}</p>
                            <p className="font-semibold text-amber-300 flex items-center justify-between gap-3 pt-0.5">
                              <span>{viewPerspective === 'students' ? 'Students Registered:' : 'Faculty Members:'}</span>
                              <span className="font-extrabold text-sm text-white">{data.registered}</span>
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey="registered"
                    name={viewPerspective === 'students' ? 'Students Registered' : 'Faculty Assigned'}
                    radius={[10, 10, 0, 0]}
                    onMouseEnter={(_, index) => setActiveBarIndex(index)}
                    onMouseLeave={() => setActiveBarIndex(null)}
                    animationDuration={600}
                  >
                    <LabelList dataKey="registered" position="top" fill="#001941" fontSize={12} fontWeight={700} offset={8} />
                    {barChartData.map((_, index) => {
                      const isAnyHovered = activeBarIndex !== null
                      const isCurrentHovered = activeBarIndex === index
                      const barOpacity = isAnyHovered ? (isCurrentHovered ? 1.0 : 0.25) : 1.0
                      const color = VIBGYOR_COLORS[index % VIBGYOR_COLORS.length]

                      return (
                        <Cell
                          key={`bar-cell-${index}`}
                          fill={color}
                          className="cursor-pointer transition-opacity duration-200"
                          style={{ opacity: barOpacity }}
                        />
                      )
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Program Breakdown List with Progress Indicators */}
        <div className="lg-card rounded-3xl p-5 md:p-6 flex flex-col justify-between max-h-[440px] overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-transparent pb-2 z-10">
              <div>
                <h3 className="font-bold text-[#001941] text-base md:text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Program Breakdown ({viewPerspective === 'students' ? 'Student Data' : 'Faculty Data'})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {viewPerspective === 'students' ? 'Enrolled student counts & share' : 'Faculty allocation counts & share'}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {filteredPrograms.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-6 text-center">
                  No programs checked.
                </div>
              ) : (
                filteredPrograms.map((prog, index) => {
                  const color = VIBGYOR_COLORS[index % VIBGYOR_COLORS.length]
                  const totalBase = viewPerspective === 'students' ? totalEnrolledStudents : totalFacultyAssigned
                  const itemVal = viewPerspective === 'students' ? prog.students : prog.facultyCount
                  const percentage = totalBase > 0
                    ? Math.round((itemVal / totalBase) * 100)
                    : 0

                  return (
                    <div
                      key={prog.id}
                      className="p-3 rounded-2xl bg-white/40 border border-slate-200/50 hover:bg-white/70 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-slate-900 truncate">{prog.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[#001941] font-mono">{itemVal} {unitLabel}</span>
                          <span className="text-slate-400 font-normal">({percentage}%)</span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 2)}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
