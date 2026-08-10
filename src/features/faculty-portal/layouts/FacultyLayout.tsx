import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, LogOut, Sparkles, Menu, X, ChevronDown, User, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'

export function FacultyLayout() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Close user profile dropdown when clicking anywhere outside or pressing Escape
  useEffect(() => {
    if (!userMenuOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const userMenuEl = document.getElementById('user-menu-container')
      if (userMenuEl && !userMenuEl.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [userMenuOpen])

  const userMetaDataName = (user?.user_metadata?.name as string) || (user?.app_metadata?.name as string)
  const emailPrefix = user?.email?.split('@')[0] ?? ''
  const displayName = userMetaDataName || (emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : 'Faculty')

  const words = displayName.trim().split(/\s+/)
  const initials = words.length >= 2 
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase() 
    : displayName.substring(0, 2).toUpperCase()

  const handleSignOut = async () => {
    await signOut()
  }

  const navItems = [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/faculty/courses',   label: 'My Courses',  icon: BookOpen },
  ]

  return (
    <div className="relative min-h-screen font-sans text-srm-on-surface flex flex-col overflow-x-hidden">
      {/* Animated Ambient Mesh Canvas */}
      <div className="app-background" />

      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-topbar-height lg-header flex items-center justify-between px-6">
        {/* Left: brand */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            id="mobile-menu-toggle"
            className="md:hidden p-2 rounded-lg text-srm-on-surface-muted hover:bg-srm-surface-container transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="w-8 h-8 rounded-full bg-srm-primary-fixed flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/8.-SRM-Logo-300x300.webp" alt="SRM Logo" className="w-7 h-7 object-contain" />
          </div>
          <span className="font-extrabold text-[17px] text-[#001941] tracking-tight">
            Compensatory Course
          </span>
        </div>

        {/* Right: user menu dropdown */}
        <div id="user-menu-container" className="relative">
          <button
            id="user-menu-button"
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full lg-btn-ghost cursor-pointer"
            aria-label={`User menu for ${displayName}`}
            aria-expanded={userMenuOpen}
          >
            <div className="w-8 h-8 rounded-full bg-srm-primary-fixed border border-white/50 flex items-center justify-center text-srm-primary font-bold text-sm shrink-0">
              {initials}
            </div>
            <span className="font-semibold text-xs text-srm-primary tracking-tight max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Dropdown Popup */}
          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-56 lg-dropdown z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2.5 border-b border-white/40 mb-1 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-srm-primary-fixed border border-white/50 flex items-center justify-center text-srm-primary font-bold text-sm shrink-0">
                    {initials}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-srm-primary truncate leading-snug">{displayName}</p>
                    <p className="text-[11px] text-srm-on-surface-muted truncate">{user?.email || 'Faculty'}</p>
                  </div>
                </div>

                <button
                  id="header-logout-btn"
                  onClick={() => {
                    setUserMenuOpen(false)
                    handleSignOut()
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-600 hover:text-white border border-rose-200/80 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer active:scale-98"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── Below header ─────────────────────────────────────────────── */}
      <div className="flex flex-1 pt-topbar-height">

        {/* ── Sidebar — desktop ───────────────────────────────────────── */}
        <aside className={`hidden md:flex flex-col fixed left-0 top-topbar-height bottom-0 lg-sidebar z-40 py-6 transition-all duration-300 ${
          isCollapsed ? 'w-[76px] px-3' : 'w-[250px] px-4'
        }`}>

          {/* Sidebar header block */}
          {isCollapsed ? (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-srm-primary hover:bg-slate-100 transition-colors cursor-pointer"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-6 px-2">
              <p className="font-bold text-sm text-[#001941] tracking-tight uppercase">Faculty Portal</p>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-srm-primary hover:bg-slate-100 transition-colors cursor-pointer"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Nav items */}
          <nav className="flex-1 flex flex-col gap-1.5" aria-label="Faculty navigation">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                title={isCollapsed ? label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isCollapsed ? 'justify-center px-0' : 'px-4'
                  } ${
                    isActive
                      ? 'lg-nav-active text-white font-semibold'
                      : 'text-slate-700 hover:bg-white/50 hover:text-[#001941]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    {!isCollapsed && <span>{label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Logout pinned at bottom — Centered & Enhanced */}
          <div className="pt-4 border-t border-white/40">
            <button
              id="faculty-signout-btn"
              onClick={handleSignOut}
              title={isCollapsed ? 'Logout' : undefined}
              className={`w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-bold lg-btn-logout cursor-pointer ${
                isCollapsed ? 'px-0' : 'px-4'
              }`}
              aria-label="Sign out of faculty portal"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* ── Mobile overlay sidebar ──────────────────────────────────── */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-srm-on-surface/40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
        <aside
          className={`fixed left-0 top-topbar-height bottom-0 w-sidebar-width bg-white border-r border-slate-200/90 z-50 flex flex-col py-6 px-4 md:hidden transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Sidebar header block */}
          <div className="mb-4 px-2">
            <p className="font-bold text-lg text-srm-primary leading-tight tracking-tight">Faculty Portal</p>
          </div>

          <nav className="flex-1 flex flex-col gap-1.5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#001941] text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#001941]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-200/90">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-600 hover:text-white border border-rose-200/90 shadow-2xs transition-all cursor-pointer active:scale-98"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ── Main content area ────────────────────────────────────────── */}
        <main className={`flex-1 min-h-[calc(100vh-64px)] flex flex-col transition-all duration-300 ${
          isCollapsed ? 'md:ml-[76px]' : 'md:ml-[250px]'
        }`}>
          {/* SRM Logo watermark */}
          <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center transition-all duration-300" style={{ left: isCollapsed ? '76px' : '250px' }}>
            <img
              src="/8.-SRM-Logo-300x300.webp"
              alt=""
              aria-hidden="true"
              className="w-[450px] h-[450px] object-contain select-none"
              style={{ opacity: 0.35, filter: 'drop-shadow(0 10px 25px rgba(0, 25, 65, 0.10))' }}
            />
          </div>
          <div className="flex-1 px-6 py-8 md:px-8 md:py-10 max-w-5xl mx-auto w-full relative z-10">
            <Outlet />
          </div>

          {/* Footer */}
          <footer className="lg-footer py-4 mt-auto">
            <div className="max-w-5xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#001941] shrink-0" />
                <span>
                  Created by{' '}
                  <strong className="text-[#001941] font-bold">Sanjay Ganesh</strong> &{' '}
                  <strong className="text-[#001941] font-bold">Tushar Sinha</strong>{' '}
                  (3rd Year AIML) under the guidance of{' '}
                  <strong className="text-[#001941] font-bold">Dr. Vinoth R</strong>
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                &copy; {new Date().getFullYear()} SRMIST Academic Management System
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* ── Mobile bottom navigation ────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 lg-mobile-nav flex z-50" aria-label="Mobile navigation">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 gap-1 text-[10px] font-bold transition-colors ${
                isActive ? 'text-[#001941]' : 'text-slate-500 hover:text-[#001941]'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label === 'My Courses' ? 'Courses' : label}</span>
          </NavLink>
        ))}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center flex-1 gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  )
}
