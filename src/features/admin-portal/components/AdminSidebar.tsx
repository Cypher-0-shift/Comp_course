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
        'lg-sidebar flex flex-col transition-all duration-300 ease-in-out z-50 shrink-0 select-none',
        'fixed inset-y-0 left-0 md:relative',
        collapsed ? '-translate-x-full md:translate-x-0 md:w-[76px]' : 'translate-x-0 w-[250px]'
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition hover:border-[#001941]/30 hover:text-[#001941] cursor-pointer"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Sidebar Header Branding */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-slate-200/70', collapsed && 'md:justify-center md:px-2')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#001941]/10 border border-[#001941]/15">
          <ShieldCheck className="h-5 w-5 text-[#001941]" />
        </div>
        <div className={cn('overflow-hidden whitespace-nowrap', collapsed ? 'block md:hidden' : 'block')}>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#001941]">{roleLabel} Portal</p>
          <p className="text-sm font-semibold text-slate-700">Management UI</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 p-3" aria-label="Admin navigation">
        <p className={cn('px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2', collapsed ? 'block md:hidden' : 'block')}>
          Navigation
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
                'group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 md:py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer min-h-[48px]',
                isActive
                  ? 'lg-nav-active text-white'
                  : 'text-slate-600 hover:bg-[#001941]/8 hover:text-[#001941]',
                collapsed && 'md:justify-center md:px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-105',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#001941]'
                )}
              />
              <div className={cn('flex flex-1 items-center justify-between overflow-hidden', collapsed ? 'flex md:hidden' : 'flex')}>
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500 border border-slate-200/80'
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

      {/* Bottom Logout */}
      <div className="border-t border-slate-200/70 p-3">
        <button
          id="admin-sidebar-logout-btn"
          onClick={() => signOut()}
          className={cn(
            'lg-btn-logout flex w-full items-center gap-3 px-3 py-3 md:py-2.5 text-sm font-semibold cursor-pointer min-h-[48px] rounded-xl',
            collapsed && 'md:justify-center md:px-0'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className={cn(collapsed ? 'inline md:hidden' : 'inline')}>Logout</span>
        </button>
      </div>
    </aside>
  )
}
