import { Outlet } from 'react-router-dom'
import { GraduationCap, LogOut, Sparkles, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/shared/hooks/useAuth'

export function StudentLayout() {
  const { user, signOut } = useAuth()
  const displayName = user?.email?.split('@')[0] ?? 'Student'

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col relative selection:bg-indigo-500 selection:text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 p-0.5 ring-1 ring-indigo-500/40 shadow-md flex items-center justify-center text-white">
              <div className="w-full h-full bg-indigo-950/60 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  Compensatory Portal
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Student
                </span>
              </div>
              <p className="text-[11px] text-indigo-200/70 hidden sm:block">Academic Progress & Attendance Dashboard</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-full shadow-sm text-slate-200">
              <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white text-xs font-semibold">
                {displayName.charAt(0).toUpperCase()}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
              <span className="text-xs font-semibold text-slate-200 tracking-tight max-w-[140px] truncate sm:max-w-none">
                {displayName}
              </span>
            </div>

            <Button
              id="student-signout-btn"
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 px-3"
              onClick={() => signOut()}
              aria-label="Sign out"
              title="Sign out of student portal"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs font-medium hidden sm:inline">Sign Out</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 max-w-6xl relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 relative z-10 mt-auto text-slate-400">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium text-slate-300">Secure Student Academic Session</span>
          </div>

          {/* Project Attribution Credits */}
          <div className="flex items-center gap-1.5 text-center text-slate-300 font-medium bg-slate-800/80 border border-slate-700/60 px-3.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>
              Created by <strong className="text-white font-semibold">Sanjay Ganesh</strong> &{' '}
              <strong className="text-white font-semibold">Tushar Sinha</strong> (3rd Year AIML) under the guidance of{' '}
              <strong className="text-indigo-400 font-semibold">Dr. Vinoth R</strong>
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} Academic Management System
          </div>
        </div>
      </footer>
    </div>
  )
}
