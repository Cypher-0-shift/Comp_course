import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../shared/hooks/useAuth'
import { UserRole } from '../../shared/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { role, isLoading } = useAuth()
  const location = useLocation()

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // No session - redirect to login with current path as redirect param
  if (!role) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user's currently active role is allowed
  let isAllowed = allowedRoles.includes(role)

  // If active role is not allowed, but they HAVE an allowed role in availableRoles,
  // automatically switch their active role to the first matching allowed role.
  const { availableRoles, switchRole } = useAuth()
  if (!isAllowed && availableRoles) {
    const matchingRole = availableRoles.find((r) => allowedRoles.includes(r))
    if (matchingRole) {
      // Switch their active role under the hood
      switchRole(matchingRole)
      isAllowed = true
    }
  }

  if (!isAllowed) {
    const envAppType = import.meta.env.VITE_APP_TYPE
    
    // If running in dedicated portal mode (student vs staff), block cross-portal access cleanly
    if (envAppType) {
      return <Navigate to="/access-denied" state={{ from: location }} replace />
    }

    // Deep link redirect: if user tries to access wrong dashboard, redirect to their correct one
    const currentPath = location.pathname
    // Default to the first available role if role is somehow null
    const fallbackRole = role || (availableRoles && availableRoles[0]) || 'student'
    const targetDashboard =
      fallbackRole === 'student' ? '/student' : fallbackRole === 'faculty' ? '/faculty' : '/admin'

    if (currentPath.startsWith('/student') || currentPath.startsWith('/faculty') || currentPath.startsWith('/admin')) {
      return (
        <Navigate
          to={targetDashboard}
          state={{ redirected: true, fromRole: fallbackRole }}
          replace
        />
      )
    }

    // Otherwise show access denied page
    return <Navigate to="/access-denied" state={{ from: location }} replace />
  }

  return <>{children}</>
}