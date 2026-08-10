import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/shared/hooks/useAuth'
import { getStudentProfile } from './student'
import type { StudentWithRelations } from '@/shared/types'

/**
 * TanStack Query hook for the authenticated student's profile.
 *
 * Cache key: ['student', 'profile', userId]
 * Stale time: 5 min (from global QueryClient config)
 * GC time: 24 hr (from global QueryClient config)
 *
 * Usage:
 *   const { data: profile, isLoading, isError, refetch } = useStudentProfile()
 */
export function useStudentProfile() {
  const { user } = useAuth()

  return useQuery<StudentWithRelations | null, Error>({
    queryKey: ['student', 'profile', user?.id ?? 'anonymous'],
    queryFn: getStudentProfile,
    // Only run when user is authenticated
    enabled: Boolean(user?.id),
    // Profile data: treat as fresh for 10 minutes (override global 5 min)
    staleTime: 10 * 60 * 1000,
  })
}
