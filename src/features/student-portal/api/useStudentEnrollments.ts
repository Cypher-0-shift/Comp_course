import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/shared/hooks/useAuth'
import { getStudentEnrollments } from './student'
import type { EnrollmentWithRelations } from '@/shared/types'

/**
 * TanStack Query hook for the authenticated student's course enrollments.
 *
 * Cache key: ['student', 'enrollments', userId]
 * Stale time: 5 min (from global QueryClient config)
 * GC time: 24 hr (from global QueryClient config)
 *
 * Usage:
 *   const { data: enrollments = [], isLoading, isError, refetch } = useStudentEnrollments()
 */
export function useStudentEnrollments() {
  const { user } = useAuth()

  return useQuery<EnrollmentWithRelations[], Error>({
    queryKey: ['student', 'enrollments', user?.id ?? 'anonymous'],
    queryFn: getStudentEnrollments,
    // Only run when user is authenticated
    enabled: Boolean(user?.id),
    // Phase 1 Architecture: Aggressive caching (15 minutes) for enrollments to prevent layout shifts
    staleTime: 15 * 60 * 1000,
    // Default to empty array so components don't need null checks
    placeholderData: [],
  })
}
