import { useState } from 'react'
import { BookOpen, LogOut, Bell, ShieldCheck, KeyRound, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { ChangePasswordModal } from '@/shared/components/ChangePasswordModal'

interface AdminHeaderProps {
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
}

export function AdminHeader({ sidebarOpen, onToggleSidebar }: AdminHeaderProps) {
  const { user, role, departmentName, signOut, availableRoles, switchRole } = useAuth()
  const navigate = useNavigate()
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  const userMetaDataName = (user?.user_metadata?.name as string) || (user?.app_metadata?.name as string)
  const emailPrefix = user?.email?.split('@')[0] ?? ''
  const displayName = userMetaDataName || (emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : 'Admin')

  const words = displayName.trim().split(/\s+/)
  const initial = words.length >= 2
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : displayName.substring(0, 2).toUpperCase()
  const roleLabel = role === 'hod' ? 'HOD' : role === 'dean' ? 'Dean' : 'Admin'

  return (
    <header className="lg-header sticky top-0 z-30">
      <div className="mx-auto flex h-16 max-w-full items-center justify-between px-4 sm:px-6">

        {/* Left Side: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg-btn-ghost flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition cursor-pointer"
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
            {/* Logo icon — navy glass */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#001941]/10 border border-[#001941]/15 shadow-sm">
              <BookOpen className="h-5 w-5 text-[#001941]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base md:text-lg font-extrabold tracking-tight text-[#001941] truncate max-w-[130px] md:max-w-none">
                  Compensatory Portal
                </h1>
                {/* Role badge */}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#001941]/8 text-[#001941] border border-[#001941]/20">
                  {roleLabel}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <ShieldCheck className="h-3 w-3" /> Executive Dashboard
                </span>
                {departmentName && (
                  <span className="text-[11px] text-slate-400">• {departmentName}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Switch Role Button */}
          {availableRoles && availableRoles.includes('faculty') && (
            <button
              onClick={() => {
                switchRole('faculty')
                navigate('/faculty/dashboard', { replace: true })
              }}
              className="lg-btn-ghost flex h-9 items-center justify-center gap-2 rounded-xl text-slate-600 px-3 transition cursor-pointer"
              title="Switch to Faculty View"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-semibold">Faculty View</span>
            </button>
          )}

          {/* Notification bell */}
          <button
            className="lg-btn-ghost relative flex items-center justify-center rounded-full text-slate-600 transition cursor-pointer h-9 w-9"
            title="System Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#001941] ring-2 ring-white" />
          </button>

          {/* Change Password */}
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="lg-btn-ghost relative flex items-center justify-center rounded-full text-slate-600 transition cursor-pointer h-9 w-9"
            title="Change Password"
          >
            <KeyRound className="h-4 w-4" />
          </button>

          {/* User Profile Pill — lg-pill-slate */}
          <div className="lg-pill-slate flex items-center gap-2.5 py-1.5 pl-2 pr-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#001941] to-[#0b2e63] text-xs font-bold text-white shadow-sm">
              {initial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none capitalize">{displayName}</p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">{roleLabel}</p>
            </div>
          </div>

          {/* Sign Out */}
          <button
            id="admin-header-signout-btn"
            onClick={() => signOut()}
            className="lg-btn-logout flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer min-h-[36px]"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </header>
  )
}
