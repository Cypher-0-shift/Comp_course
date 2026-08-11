import { useState, useMemo } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import * as Select from '@radix-ui/react-select'
import { Building2, GraduationCap, Users, BookOpen, ChevronDown, Check } from 'lucide-react'
import { StudentEnrollmentTab } from '@/features/admin-portal/components/StudentEnrollmentTab'
import { FacultyAssignmentsTab } from '@/features/admin-portal/components/FacultyAssignmentsTab'
import { useStudentList } from '@/features/faculty-dashboard/api/useStudentList'
import { useFacultyList } from '@/features/faculty-dashboard/api/useFacultyList'
import { cn } from '@/shared/utils/cn'

export function Directory() {
  const [selectedDept, setSelectedDept] = useState<string>('all')

  const studentQuery = useStudentList({ filters: {}, search: '', crossDept: true })
  const facultyQuery = useFacultyList({ filters: {}, search: '', crossDept: true })

  const rawStudentRows = studentQuery.data?.rows || []
  const rawFacultyRows = facultyQuery.data?.rows || []

  const getCleanProgramTitle = (name: string): string => {
    if (!name) return ''
    return name
      .replace(/^(B\.Tech\.|B\.Arch\.|B\.Des\.|M\.Tech\.|M\.Arch\.)\s*-?\s*/i, '')
      .replace(/^(B\.Tech|B\.Arch|B\.Des|M\.Tech|M\.Arch)\s*-\s*/i, '')
      .trim()
  }

  // Extract unique departments for dropdown
  const uniqueDepartments = useMemo(() => {
    const map = new Set<string>()
    rawStudentRows.forEach((r) => r.department_name && map.add(r.department_name))
    rawFacultyRows.forEach((r) => r.department_name && map.add(r.department_name))
    return Array.from(map).sort()
  }, [rawStudentRows, rawFacultyRows])

  const filteredStudentRows = useMemo(() => {
    if (selectedDept === 'all') return rawStudentRows
    return rawStudentRows.filter((r) => r.department_name === selectedDept)
  }, [rawStudentRows, selectedDept])

  const filteredFacultyRows = useMemo(() => {
    if (selectedDept === 'all') return rawFacultyRows
    return rawFacultyRows.filter((r) => r.department_name === selectedDept)
  }, [rawFacultyRows, selectedDept])

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header & Dept Selection */}
      <div className="lg-card flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#001941]/8 text-[#001941] border border-[#001941]/15">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#001941]">Directory & Analytics</h1>
            <p className="text-xs text-slate-500">
              Institution-wide department search
            </p>
          </div>
        </div>

        {/* Dept Selection Custom Radix Dropdown */}
        <div className="flex items-center gap-2">
          <Select.Root value={selectedDept} onValueChange={setSelectedDept}>
            <Select.Trigger
              id="dept-dropdown"
              className="lg-pill-slate flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#001941] outline-none cursor-pointer hover:bg-slate-100 transition-all rounded-xl border border-slate-200/90 shadow-2xs"
            >
              <BookOpen className="h-4 w-4 text-[#001941] shrink-0" />
              <span className="font-medium text-slate-500">Select Department:</span>
              <Select.Value>
                {selectedDept === 'all'
                  ? `All Departments (${uniqueDepartments.length})`
                  : getCleanProgramTitle(selectedDept)}
              </Select.Value>
              <Select.Icon>
                <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 ml-1" />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content
                className="z-50 min-w-[240px] rounded-2xl bg-white border border-slate-200 p-1 shadow-xl animate-in fade-in-80 zoom-in-95 duration-100"
                position="popper"
                sideOffset={6}
              >
                <Select.Viewport className="p-1 max-h-60 overflow-y-auto space-y-0.5">
                  <Select.Item
                    value="all"
                    className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 hover:text-[#001941] data-[state=checked]:bg-[#001941]/5 data-[state=checked]:text-[#001941] data-[state=checked]:font-bold"
                  >
                    <Select.ItemText>
                      All Departments ({uniqueDepartments.length})
                    </Select.ItemText>
                    <Select.ItemIndicator>
                      <Check className="h-3.5 w-3.5 text-[#001941]" />
                    </Select.ItemIndicator>
                  </Select.Item>

                  <div className="h-px bg-slate-100 my-1" />

                  {uniqueDepartments.map((dept) => (
                    <Select.Item
                      key={dept}
                      value={dept}
                      className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 hover:text-[#001941] data-[state=checked]:bg-[#001941]/5 data-[state=checked]:text-[#001941] data-[state=checked]:font-bold"
                    >
                      <Select.ItemText>{getCleanProgramTitle(dept)}</Select.ItemText>
                      <Select.ItemIndicator>
                        <Check className="h-3.5 w-3.5 text-[#001941]" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="students">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-4">
          <Tabs.List className="flex gap-2">
            <Tabs.Trigger
              value="students"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer',
                'data-[state=active]:bg-[#001941] data-[state=active]:text-white data-[state=active]:shadow-md',
                'data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:bg-slate-100'
              )}
            >
              <GraduationCap className="h-4 w-4" />
              Student Data
            </Tabs.Trigger>
            <Tabs.Trigger
              value="faculty"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer',
                'data-[state=active]:bg-[#001941] data-[state=active]:text-white data-[state=active]:shadow-md',
                'data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:bg-slate-100'
              )}
            >
              <Users className="h-4 w-4" />
              Faculty Data
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        <Tabs.Content value="students" className="outline-none focus:outline-none animate-in fade-in duration-300">
          <StudentEnrollmentTab rows={filteredStudentRows as any} isLoading={studentQuery.isLoading} />
        </Tabs.Content>

        <Tabs.Content value="faculty" className="outline-none focus:outline-none animate-in fade-in duration-300">
          <FacultyAssignmentsTab rows={filteredFacultyRows as any} isLoading={facultyQuery.isLoading} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
