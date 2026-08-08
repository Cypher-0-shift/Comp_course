import { Routes, Route, Navigate } from 'react-router-dom'
import { BookOpen, LayoutDashboard, Users, Upload, LogOut } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { DepartmentOverview } from './DepartmentOverview'
import { DepartmentDetail } from './DepartmentDetail'
import { DataImportPage } from './DataImportPage'
import { StudentEnrollmentTab } from './StudentEnrollmentTab'
import { cn } from '@/shared/utils/cn'

const NAV_ITEMS = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard },
  { path: '/admin/students', label: 'Student List', icon: Users },
  { path: '/admin/import', label: 'Data Import', icon: Upload },
] as const

export function AdminDashboard() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const displayName = user?.email?.split('@')[0] ?? 'Admin'
  const roleLabel = role === 'hod' ? 'HOD' : role === 'dean' ? 'Dean' : 'Admin'

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_theme(colors.violet.950)_0%,_theme(colors.slate.950)_60%)]">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 ring-1 ring-violet-400/30">
              <BookOpen className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-slate-100">
                Compensatory Course Dashboard
              </p>
              <p className="text-xs text-slate-500">{roleLabel} Portal</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const isActive = path === '/admin'
                ? location.pathname === '/admin' || location.pathname.startsWith('/admin/departments')
                : location.pathname.startsWith(path)

              return (
                <button
                  key={path}
                  id={`admin-nav-${label.toLowerCase().replace(/\s/g, '-')}`}
                  onClick={() => navigate(path)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition',
                    isActive
                      ? 'bg-violet-600/80 text-white shadow'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              )
            })}
          </nav>

          {/* User + signout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 ring-1 ring-violet-400/30 text-xs font-bold text-violet-300">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium text-slate-200 leading-none">{displayName}</p>
                <p className="text-xs text-slate-500 leading-none mt-0.5">{roleLabel}</p>
              </div>
            </div>
            <button
              id="admin-signout-btn"
              onClick={() => signOut()}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:border-red-400/30 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
        <Routes>
          <Route index element={
            <section>
              <div className="mb-5">
                <h1 className="text-lg font-bold text-slate-100">Department Overview</h1>
                <p className="text-sm text-slate-400">
                  {role === 'hod' ? 'Showing your department data' : 'All departments — full visibility'}
                </p>
              </div>
              <DepartmentOverview />
            </section>
          } />
          <Route path="students" element={
            <section>
              <div className="mb-5">
                <h1 className="text-lg font-bold text-slate-100">Student List</h1>
                <p className="text-sm text-slate-400">
                  {role === 'hod' ? 'Enrolled students in your department' : 'All enrolled students across departments'}
                </p>
              </div>
              <StudentEnrollmentTab />
            </section>
          } />
          <Route path="departments/:id" element={<DepartmentDetail />} />
          <Route path="import" element={<DataImportPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  )
}
