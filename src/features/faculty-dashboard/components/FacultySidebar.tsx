import { LayoutDashboard, GraduationCap, Building2, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { cn } from '@/shared/utils/cn'

export type FacultyTabType = 'dashboard' | 'faculty' | 'department'

interface FacultySidebarProps {
  activeTab: FacultyTabType
  onTabChange: (tab: FacultyTabType) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function FacultySidebar({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
}: FacultySidebarProps) {
  const { signOut } = useAuth()

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Faculty Dashboard',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Main',
    },
    {
      id: 'faculty' as const,
      label: 'Faculty List',
      shortLabel: 'Faculty',
      icon: GraduationCap,
      badge: 'Directory',
    },
    {
      id: 'department' as const,
      label: 'Department Overview',
      shortLabel: 'Dept',
      icon: Building2,
      badge: 'Depts',
    },
  ]

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-slate-800 bg-slate-950/95 transition-all duration-300 ease-in-out z-20 shrink-0 select-none',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 shadow-md transition hover:border-indigo-500 hover:text-white"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Sidebar Header Branding */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-slate-800/60', collapsed && 'justify-center px-2')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
          <GraduationCap className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Faculty Portal</p>
            <p className="text-sm font-semibold text-slate-200">Management UI</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 p-3">
        <p className={cn('px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2', collapsed && 'hidden')}>
          Navigation Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-950/60 ring-1 ring-indigo-400/40'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-105',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                )}
              />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Fixed Bottom Logout Section */}
      <div className="border-t border-slate-800/80 p-3">
        <button
          id="faculty-sidebar-logout-btn"
          onClick={() => signOut()}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-150 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-red-400" />
          {!collapsed && <span className="font-semibold">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
