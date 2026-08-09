import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react'
import { Session, User } from '@supabase/supabase-js'
import { UserRole } from '../../shared/types'
import { getSupabaseClient, signOut as supabaseSignOut } from '../../shared/hooks/useSupabase'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

// =============================================
// Types
// =============================================

export interface AuthContextType {
  session: Session | null
  user: User | null
  role: UserRole | null
  departmentId: string | null
  departmentName: string | null
  empId: string | null
  isLoading: boolean
  signOut: () => Promise<void>
  redirectToDashboard: (role: UserRole) => void
}

// Session tracking for concurrent session limit
interface TrackedSession {
  userId: string
  sessionId: string
  timestamp: number
  tabId: string
}

const MAX_CONCURRENT_SESSIONS = 3
const IDLE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const IDLE_CHECK_INTERVAL_MS = 60 * 1000 // 1 minute
const SESSION_STORAGE_KEY = 'ccd_sessions'
const TAB_ID_KEY = 'ccd_tab_id'

// =============================================
// Context
// =============================================

const AuthContext = createContext<AuthContextType | null>(null)

// =============================================
// Helper Functions
// =============================================

/**
 * Generate a unique tab ID for this browser tab
 */
function getTabId(): string {
  if (typeof window === 'undefined') return 'server'
  let tabId = sessionStorage.getItem(TAB_ID_KEY)
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem(TAB_ID_KEY, tabId)
  }
  return tabId
}

/**
 * Get all tracked sessions from localStorage
 */
function getTrackedSessions(): TrackedSession[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save tracked sessions to localStorage
 */
function saveTrackedSessions(sessions: TrackedSession[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions))
}

/**
 * Register current session for concurrent session tracking
 */
function registerSession(userId: string, sessionId: string): void {
  const tabId = getTabId()
  const sessions = getTrackedSessions()

  // Remove any existing session for this tab
  const filtered = sessions.filter((s) => s.tabId !== tabId)

  // Add new session
  filtered.push({
    userId,
    sessionId,
    timestamp: Date.now(),
    tabId,
  })

  saveTrackedSessions(filtered)
}

/**
 * Unregister current session
 */
function unregisterSession(): void {
  const tabId = getTabId()
  const sessions = getTrackedSessions()
  const filtered = sessions.filter((s) => s.tabId !== tabId)
  saveTrackedSessions(filtered)
}

/**
 * Check and enforce max concurrent sessions
 * Returns true if session was allowed, false if oldest was kicked
 */
function enforceMaxSessions(userId: string): boolean {
  const sessions = getTrackedSessions().filter((s) => s.userId === userId)

  // Remove expired sessions (older than 24 hours)
  const now = Date.now()
  const validSessions = sessions.filter((s) => now - s.timestamp < 24 * 60 * 60 * 1000)

  if (validSessions.length >= MAX_CONCURRENT_SESSIONS) {
    // Sort by timestamp, oldest first
    validSessions.sort((a, b) => a.timestamp - b.timestamp)

    // Remove oldest session
    const oldest = validSessions[0]
    const allSessions = getTrackedSessions()
    const filtered = allSessions.filter((s) => s.sessionId !== oldest.sessionId)
    saveTrackedSessions(filtered)

    // Notify the oldest tab (if it's still open)
    if (typeof window !== 'undefined' && oldest.tabId !== getTabId()) {
      // Dispatch custom event for cross-tab communication
      window.dispatchEvent(
        new CustomEvent('ccd:session-kicked', {
          detail: { sessionId: oldest.sessionId },
        })
      )
    }

    toast.warning('Max sessions reached', {
      description: 'Oldest session ended. You have been logged in.',
    })
    return false
  }

  return true
}

/**
 * Extract role and department from user app_metadata
 */
export function extractUserMetadata(user: User | null): {
  role: UserRole | null
  departmentId: string | null
  departmentName: string | null
  empId: string | null
} {
  if (!user) return { role: null, departmentId: null, departmentName: null, empId: null }

  const appMetadata = user.app_metadata as
    | { role?: UserRole; department_id?: string; department_name?: string; department?: string; emp_id?: string; empId?: string }
    | undefined

  const deptName =
    appMetadata?.department_name ??
    appMetadata?.department ??
    null

  const deptId =
    appMetadata?.department_id ??
    null

  const empId =
    appMetadata?.emp_id ??
    appMetadata?.empId ??
    null

  return {
    role: appMetadata?.role ?? null,
    departmentId: deptId,
    departmentName: deptName,
    empId,
  }
}

// =============================================
// AuthProvider Component
// =============================================

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  const supabase = getSupabaseClient()

  // State
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Refs
  const lastActivityRef = useRef<number>(Date.now())
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activityListenersRef = useRef<(() => void)[]>([])
  const isSignedOutRef = useRef(false)
  const sessionRef = useRef<Session | null>(null)

  // Keep sessionRef updated
  useEffect(() => {
    sessionRef.current = session
  }, [session])

  // Computed values
  const { role, departmentId, departmentName, empId } = extractUserMetadata(user)

  // =============================================
  // Activity Tracking (for idle timeout)
  // =============================================

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
  }, [])

  const startActivityTracking = useCallback(() => {
    if (typeof window === 'undefined') return

    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll']
    const listeners = events.map((event) => {
      const handler = () => updateActivity()
      window.addEventListener(event, handler, { passive: true })
      return () => window.removeEventListener(event, handler)
    })

    activityListenersRef.current = listeners
  }, [updateActivity])

  const stopActivityTracking = useCallback(() => {
    activityListenersRef.current.forEach((cleanup) => cleanup())
    activityListenersRef.current = []
  }, [])

  // =============================================
  // Sign Out Handler
  // =============================================

  const handleSignOut = useCallback(async () => {
    if (idleTimerRef.current) {
      clearInterval(idleTimerRef.current)
      idleTimerRef.current = null
    }
    stopActivityTracking()
    unregisterSession()
    isSignedOutRef.current = true

    try {
      await supabaseSignOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setSession(null)
      setUser(null)
      navigate('/login')
    }
  }, [navigate, stopActivityTracking])

  // =============================================
  // Idle Timeout Check
  // =============================================

  const checkIdleTimeout = useCallback(() => {
    if (!sessionRef.current || isSignedOutRef.current) return

    const timeSinceActivity = Date.now() - lastActivityRef.current
    if (timeSinceActivity >= IDLE_TIMEOUT_MS) {
      // Idle timeout reached - sign out
      isSignedOutRef.current = true
      handleSignOut()
      toast.error('Session expired', {
        description: 'You have been logged out due to 30 minutes of inactivity.',
      })
    }
  }, [handleSignOut])

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) return
    idleTimerRef.current = setInterval(checkIdleTimeout, IDLE_CHECK_INTERVAL_MS)
  }, [checkIdleTimeout])

  const stopIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearInterval(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }, [])

  // =============================================
  // Redirect to Dashboard
  // =============================================

  const redirectToDashboard = useCallback(
    (userRole: UserRole) => {
      switch (userRole) {
        case 'student':
          navigate('/student')
          break
        case 'faculty':
          navigate('/faculty')
          break
        case 'hod':
        case 'dean':
          navigate('/admin')
          break
        default:
          navigate('/login')
      }
    },
    [navigate]
  )



  // =============================================
  // Effect 1: Initial Session Load
  // =============================================

  useEffect(() => {
    let mounted = true

    const loadInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error loading session:', error)
        }
        if (mounted && data.session) {
          setSession(data.session)
          setUser(data.session.user)
          registerSession(data.session.user.id, data.session.access_token)
          startIdleTimer()
          startActivityTracking()
        }
      } catch (error) {
        console.error('Failed to load initial session:', error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialSession()

    return () => {
      mounted = false
    }
  }, [])

  // =============================================
  // Effect 2: Auth State Change Listener
  // =============================================

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (event === 'SIGNED_OUT' || !newSession) {
          isSignedOutRef.current = false
          stopIdleTimer()
          stopActivityTracking()
          unregisterSession()
          setSession(null)
          setUser(null)
          return
        }

        // SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED
        isSignedOutRef.current = false
        setSession(newSession)
        setUser(newSession.user)

        // Register session for concurrent limit tracking
        const allowed = enforceMaxSessions(newSession.user.id)
        if (allowed) {
          registerSession(newSession.user.id, newSession.access_token)
        } else {
          // Session was rejected due to limit - sign out
          await handleSignOut()
          return
        }

        // Restart timers
        startIdleTimer()
        startActivityTracking()
      }
    )

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  // =============================================
  // Effect 3: Cross-tab Session Sync (Storage Events)
  // =============================================

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SESSION_STORAGE_KEY && event.newValue) {
        try {
          const sessions = JSON.parse(event.newValue)
          // Check if our session was removed (kicked from another tab)
          const tabId = getTabId()
          const hasOurSession = sessions.some(
            (s: TrackedSession) => s.tabId === tabId && s.userId === user?.id
          )

          if (!hasOurSession && user) {
            // Our session was removed from another tab - we were kicked
            toast.warning('Session ended', {
              description: 'You were logged out from another tab.',
            })
            handleSignOut()
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [user?.id, handleSignOut])

  // =============================================
  // Effect 4: Custom Event for Session Kicked (Same Tab)
  // =============================================

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleSessionKicked = (event: CustomEvent) => {
      const { sessionId } = event.detail
      // Check if this matches our current session
      if (session?.access_token === sessionId) {
        toast.warning('Session ended', {
          description: 'You were logged out from another tab.',
        })
        handleSignOut()
      }
    }

    window.addEventListener('ccd:session-kicked', handleSessionKicked as EventListener)
    return () => window.removeEventListener('ccd:session-kicked', handleSessionKicked as EventListener)
  }, [session?.access_token, handleSignOut])

  // =============================================
  // Effect 5: Cleanup on Unmount
  // =============================================

  useEffect(() => {
    return () => {
      stopIdleTimer()
      stopActivityTracking()
    }
  }, [stopIdleTimer, stopActivityTracking])

  // =============================================
  // Context Value
  // =============================================

  const value: AuthContextType = {
    session,
    user,
    role,
    departmentId,
    departmentName,
    empId,
    isLoading,
    signOut: handleSignOut,
    redirectToDashboard,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// =============================================
// useAuth Hook
// =============================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}