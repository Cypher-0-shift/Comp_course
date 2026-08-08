import { LayoutDashboard, Users, Upload, LogOut, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { cn } from '@/shared/utils/cn'

interface AdminSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function AdminSidebar({ collapsed, onToggleCollapse }: AdminSidebarProps) {
  const { role, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const roleLabel = role === 'hod' ? 'HOD' : role === 'dean' ? 'Dean' : 'Admin'

  const navItems = [
    {
      path: '/admin',
      label: 'Department Overview',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      badge: 'Main',
    },
    {
      path: '/admin/students',
      label: 'Student List',
      shortLabel: 'Students',
      icon: Users,
      badge: 'Directory',
    },
    {
      path: '/admin/import',
      label: 'Data Import',
      shortLabel: 'Import',
      icon: Upload,
      badge: 'Excel',
    },
  ]

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out z-50 shrink-0 select-none shadow-2xl md:shadow-md',
        'fixed inset-y-0 left-0 md:relative',
        collapsed ? '-translate-x-full md:translate-x-0 md:w-16' : 'translate-x-0 w-64'
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 shadow-md transition hover:border-violet-500 hover:text-white cursor-pointer"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Sidebar Header Branding */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-slate-800/80', collapsed && 'md:justify-center md:px-2')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600/30 text-violet-400 ring-1 ring-violet-500/40">
          <ShieldCheck className="h-5 w-5 text-violet-400" />
        </div>
        <div className={cn('overflow-hidden whitespace-nowrap', collapsed ? 'block md:hidden' : 'block')}>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-400">{roleLabel} Portal</p>
          <p className="text-sm font-semibold text-white">Management UI</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 p-3">
        <p className={cn('px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2', collapsed ? 'block md:hidden' : 'block')}>
          Navigation Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.path === '/admin'
            ? location.pathname === '/admin' || location.pathname.startsWith('/admin/departments')
            : location.pathname.startsWith(item.path)

          return (
            <button
              key={item.path}
              id={`admin-sidebar-nav-${item.shortLabel.toLowerCase()}`}
              onClick={() => navigate(item.path)}
              className={cn(
                'group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 md:py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer min-h-[48px]',
                isActive
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-950/60 ring-1 ring-violet-400/40'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white',
                collapsed && 'md:justify-center md:px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-105',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-violet-400'
                )}
              />
              <div className={cn('flex flex-1 items-center justify-between overflow-hidden', collapsed ? 'flex md:hidden' : 'flex')}>
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      isActive ? 'bg-violet-700 text-violet-100' : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </nav>

      {/* Fixed Bottom Logout Section */}
      <div className="border-t border-slate-800/80 p-3">
        <button
          id="admin-sidebar-logout-btn"
          onClick={() => signOut()}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3 md:py-2.5 text-sm font-medium text-slate-400 transition-all duration-150 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer min-h-[48px]',
            collapsed && 'md:justify-center md:px-0'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-rose-400" />
          <span className={cn('font-semibold', collapsed ? 'inline md:hidden' : 'inline')}>Logout</span>
        </button>
      </div>
    </aside>
  )
}
