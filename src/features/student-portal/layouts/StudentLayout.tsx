import { Outlet } from 'react-router-dom'
import { GraduationCap, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/shared/hooks/useAuth'

export function StudentLayout() {
  const { user, signOut } = useAuth()
  const displayName = user?.email?.split('@')[0] ?? 'Student Profile'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <GraduationCap className="h-6 w-6" />
            <span className="font-semibold text-lg tracking-tight text-slate-900">
              Student Portal
            </span>
          </div>
          
          <nav className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              <User className="h-4 w-4" />
              <span>{displayName}</span>
            </div>
            <Button
              id="student-signout-btn"
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-slate-900 cursor-pointer"
              onClick={() => signOut()}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Compensatory Course Dashboard. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
