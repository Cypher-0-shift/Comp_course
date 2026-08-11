import { BookOpen, LogOut, Bell } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'

interface FacultyHeaderProps {
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
}

export function FacultyHeader({ sidebarOpen, onToggleSidebar }: FacultyHeaderProps) {
  const { user, signOut } = useAuth()

  const userMetaDataName = (user?.user_metadata?.name as string) || (user?.app_metadata?.name as string)
  const emailPrefix = user?.email?.split('@')[0] ?? ''
  const displayName = userMetaDataName || (emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : 'Faculty')

  const words = displayName.trim().split(/\s+/)
  const initial = words.length >= 2 
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase() 
    : displayName.substring(0, 2).toUpperCase()

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-full items-center justify-between px-4 sm:px-6">
        {/* Left Side: Brand & Mobile/Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 transition hover:bg-slate-800 hover:text-white"
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/30 p-0.5 ring-1 ring-indigo-500/40 shadow-md text-white">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-indigo-950/60">
                <BookOpen className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base md:text-lg font-extrabold tracking-tight text-white truncate max-w-[130px] md:max-w-none">
                  Compensatory Portal
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Faculty
                </span>
              </div>
              <p className="text-[11px] text-indigo-200/70 font-medium hidden sm:block">Faculty Portal & Academic Analytics</p>
            </div>
          </div>
        </div>

        {/* Right Side: Notification Pill, User Menu & Sign Out */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            className="relative flex items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-slate-300 transition hover:bg-slate-800 hover:text-white h-10 w-10 md:h-8 md:w-8"
            title="System Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-slate-950" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 rounded-full border border-slate-800 bg-slate-900/80 py-1 pl-1.5 pr-3 shadow-sm text-slate-200">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-xs">
              {initial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-none capitalize">{displayName}</p>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">Faculty Member</p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            id="faculty-header-signout-btn"
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
