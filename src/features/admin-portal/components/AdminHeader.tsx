import { BookOpen, LogOut, Bell, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'

interface AdminHeaderProps {
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
}

export function AdminHeader({ sidebarOpen, onToggleSidebar }: AdminHeaderProps) {
  const { user, role, departmentName, signOut } = useAuth()

  const displayName = user?.email?.split('@')[0] ?? 'Admin'
  const initial = displayName.charAt(0).toUpperCase()
  const roleLabel = role === 'hod' ? 'HOD' : role === 'dean' ? 'Dean' : 'Admin'

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-full items-center justify-between px-4 sm:px-6">
        {/* Left Side: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 transition hover:bg-slate-800 hover:text-white cursor-pointer"
              aria-label="Toggle Sidebar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/30 p-0.5 ring-1 ring-violet-500/40 shadow-md text-white">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-indigo-950/60">
                <BookOpen className="h-5 w-5 text-violet-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base md:text-lg font-extrabold tracking-tight text-white truncate max-w-[130px] md:max-w-none">
                  Compensatory Portal
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {roleLabel}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-300">
                  <ShieldCheck className="h-3 w-3" /> Executive Dashboard
                </span>
                {departmentName && (
                  <span className="text-[11px] text-indigo-200/70">• {departmentName}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: User Profile & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            className="relative flex items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-slate-300 transition hover:bg-slate-800 hover:text-white cursor-pointer h-10 w-10 md:h-8 md:w-8"
            title="System Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-slate-950" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 rounded-full border border-slate-800 bg-slate-900/80 py-1 pl-1.5 pr-3 shadow-sm text-slate-200">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-purple-600 text-xs font-bold text-white shadow-xs">
              {initial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-none capitalize">{displayName}</p>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">{roleLabel}</p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            id="admin-header-signout-btn"
            onClick={() => signOut()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 cursor-pointer min-h-[40px] md:min-h-[48px]"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
