// Placeholder - AuthProvider will be implemented in Plan 01-02
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { UserRole } from '../../shared/types'

interface AuthContextType {
  session: Session | null
  user: User | null
  role: UserRole | null
  departmentId: string | null
  isLoading: boolean
  signOut: () => Promise<void>
  redirectToDashboard: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // These will be populated from session in Plan 01-02
  const role: UserRole | null = null
  const departmentId: string | null = null

  const signOut = async () => {
    // Placeholder - implemented in Plan 01-02
    setSession(null)
    setUser(null)
  }

  const redirectToDashboard = (userRole: UserRole) => {
    // Placeholder - implemented in Plan 01-02
    console.log('Redirect to dashboard for role:', userRole)
  }

  useEffect(() => {
    // Placeholder - session initialization will be in Plan 01-02
    setIsLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ session, user, role, departmentId, isLoading, signOut, redirectToDashboard }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}