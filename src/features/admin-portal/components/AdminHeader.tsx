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
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-full items-center justify-between px-4 sm:px-6">
        {/* Left Side: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 ring-1 ring-violet-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-100 tracking-tight">
                Compensatory Course Dashboard
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-400">
                  <ShieldCheck className="h-3 w-3" /> {roleLabel} Portal
                </span>
                {departmentName && (
                  <span className="text-[11px] text-slate-500">• {departmentName}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: User Profile & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 transition hover:text-slate-200"
            title="System Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-slate-950" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 rounded-full border border-slate-800 bg-slate-900/80 py-1 pl-1.5 pr-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white shadow-sm shadow-violet-900/50">
              {initial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-slate-200 leading-none capitalize">{displayName}</p>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">{roleLabel}</p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            id="admin-header-signout-btn"
            onClick={() => signOut()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
