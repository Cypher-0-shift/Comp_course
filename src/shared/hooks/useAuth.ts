import { useAuth as useAuthContext } from '../../app/providers/AuthProvider'
import type { AuthContextType } from '../../app/providers/AuthProvider'

/**
 * Hook to access the authentication context.
 * Provides session, user, role, departmentId, loading state, and auth actions.
 *
 * @returns AuthContextType with:
 * - session: Current Supabase session or null
 * - user: Current Supabase user or null
 * - role: User role extracted from app_metadata ('student' | 'faculty' | 'hod' | 'dean')
 * - departmentId: User's department ID from app_metadata (null for Dean)
 * - isLoading: Whether initial session load is complete
 * - signOut: Function to sign out and redirect to login
 * - redirectToDashboard: Function to navigate to role-appropriate dashboard
 */
export function useAuth(): AuthContextType {
  return useAuthContext()
}

// Re-export types for convenience
export type { AuthContextType } from '../../app/providers/AuthProvider'
export type { UserRole } from '../../shared/types'