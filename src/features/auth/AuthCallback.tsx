import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSupabaseClient } from '@/shared/hooks/useSupabase'
import { toast } from 'sonner'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const supabase = getSupabaseClient()
    
    const checkSession = async () => {
      // Small timeout to allow Supabase SDK to finish parsing url params and exchange the PKCE code
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        toast.error('Authentication callback failed: ' + error.message)
        navigate('/login')
        return
      }

      if (session) {
        const user = session.user
        const appMetadata = user.app_metadata as { role?: string }
        const userMetadata = user.user_metadata as { role?: string }
        const role = appMetadata?.role ?? userMetadata?.role

        if (role) {
          toast.success('Email verified successfully! Welcome back.')
          if (role === 'student') {
            navigate('/student', { replace: true })
          } else if (role === 'faculty') {
            navigate('/faculty', { replace: true })
          } else if (role === 'hod' || role === 'dean') {
            navigate('/admin', { replace: true })
          } else {
            navigate('/login', { replace: true })
          }
        } else {
          toast.error('Account configured without a role. Contact the administrator.')
          navigate('/login', { replace: true })
        }
      } else {
        // If session not loaded immediately, fallback to login
        const timer = setTimeout(() => {
          navigate('/login', { replace: true })
        }, 2000)
        return () => clearTimeout(timer)
      }
    }

    checkSession()
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4" />
      <p className="text-slate-400">Verifying email and preparing your workspace...</p>
    </div>
  )
}
