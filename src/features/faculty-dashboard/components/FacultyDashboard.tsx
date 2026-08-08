import * as Tabs from '@radix-ui/react-tabs'
import { Users, BookOpen, Building2, LogOut, GraduationCap } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { StudentListTab } from './StudentListTab'
import { FacultyListTab } from './FacultyListTab'
import { DepartmentListTab } from './DepartmentListTab'
import { cn } from '@/shared/utils/cn'

const TABS = [
  { id: 'student-list', label: 'Student List', icon: Users },
  { id: 'faculty-list', label: 'Faculty List', icon: GraduationCap },
  { id: 'department-list', label: 'Department List', icon: Building2 },
] as const

export function FacultyDashboard() {
  const { user, signOut } = useAuth()

  const displayName = user?.email?.split('@')[0] ?? 'Faculty'

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_theme(colors.indigo.950)_0%,_theme(colors.slate.950)_60%)]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-3">
          {/* Logo / Branding */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 ring-1 ring-indigo-400/30">
              <BookOpen className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-slate-100">
                Compensatory Course Dashboard
              </p>
              <p className="text-xs text-slate-500">Faculty Portal</p>
            </div>
          </div>

          {/* User + signout */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 ring-1 ring-indigo-400/30 text-xs font-bold text-indigo-300">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden text-sm text-slate-300 sm:block">{displayName}</span>
            <button
              id="faculty-signout-btn"
              onClick={() => signOut()}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:border-red-400/30 hover:text-red-400"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
        <Tabs.Root defaultValue="student-list" className="flex flex-col gap-4">
          {/* Tab list */}
          <Tabs.List
            className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 w-fit"
            aria-label="Faculty dashboard tabs"
          >
            {TABS.map(({ id, label, icon: Icon }) => (
              <Tabs.Trigger
                key={id}
                value={id}
                id={`tab-${id}`}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
                  'text-slate-400 transition-all duration-150',
                  'hover:text-slate-200',
                  'data-[state=active]:bg-indigo-600/80 data-[state=active]:text-white',
                  'data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-900/50'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Tab panels */}
          <Tabs.Content value="student-list" className="focus:outline-none">
            <section>
              <div className="mb-4">
                <h1 className="text-lg font-bold text-slate-100">Student List</h1>
                <p className="text-sm text-slate-400">
                  Students enrolled in your assigned courses
                </p>
              </div>
              <StudentListTab />
            </section>
          </Tabs.Content>

          <Tabs.Content value="faculty-list" className="focus:outline-none">
            <section>
              <div className="mb-4">
                <h1 className="text-lg font-bold text-slate-100">Faculty List</h1>
                <p className="text-sm text-slate-400">
                  Faculty assignments and subject registrations
                </p>
              </div>
              <FacultyListTab />
            </section>
          </Tabs.Content>

          <Tabs.Content value="department-list" className="focus:outline-none">
            <section>
              <div className="mb-4">
                <h1 className="text-lg font-bold text-slate-100">Department List</h1>
                <p className="text-sm text-slate-400">
                  Department-wise student enrollment summary
                </p>
              </div>
              <DepartmentListTab />
            </section>
          </Tabs.Content>
        </Tabs.Root>
      </main>
    </div>
  )
}
