import { Outlet } from 'react-router-dom'
import { GraduationCap, LogOut, Sparkles, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/shared/hooks/useAuth'

export function StudentLayout() {
  const { user, signOut } = useAuth()
  const displayName = user?.email?.split('@')[0] ?? 'Student'

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col relative selection:bg-indigo-500 selection:text-white font-sans">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center text-white">
              <div className="w-full h-full bg-slate-950/10 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
                  Compensatory Portal
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Student
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Academic Progress & Attendance Dashboard</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-slate-100/80 border border-slate-200/60 px-3 py-1.5 rounded-full shadow-2xs hover:bg-white hover:border-slate-300 transition-all">
              <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white text-xs font-semibold">
                {displayName.charAt(0).toUpperCase()}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <span className="text-xs font-semibold text-slate-700 tracking-tight max-w-[140px] truncate sm:max-w-none">
                {displayName}
              </span>
            </div>

            <Button
              id="student-signout-btn"
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200/60 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 px-3"
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
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/80 py-6 relative z-10 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Student Academic Session</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>&copy; {new Date().getFullYear()} Academic Management System</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

