import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../../shared/hooks/useAuth'
import { signIn, resendConfirmation, signUp, getSupabaseClient } from '../../shared/hooks/useSupabase'
import { toast } from 'sonner'
import { cn } from '../../shared/utils/cn'
import { handleUIError } from '@/shared/utils/error-handler'
// (Card components no longer used in the redesigned institutional UI)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff, User, GraduationCap } from 'lucide-react'

// =============================================
// Zod Validation Schema
// =============================================

const loginSchema = z.object({
  email: z.string().min(1, 'Email or ID is required').max(255, 'Email or ID too long'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(64, 'Password too long'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// =============================================
// LoginForm Component
// =============================================

export function LoginForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { redirectToDashboard, isLoading: authLoading } = useAuth()

  // Get query params
  const typeParam = searchParams.get('type')
  const redirectPath = searchParams.get('redirect') || null

  const envAppType = import.meta.env.VITE_APP_TYPE
  const defaultMode = envAppType === 'staff' ? 'staff' : 'student'
  const initialLoginType = typeParam === 'staff' ? 'staff' : (typeParam === 'student' ? 'student' : defaultMode)

  // State
  const [loginType, setLoginType] = useState<'student' | 'staff'>(initialLoginType)
  const [staffTab, setStaffTab] = useState<'faculty' | 'admin'>('faculty')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [errors, setErrors] = useState<Partial<LoginFormData>>({})



  // =============================================
  // Validation
  // =============================================

  const validateField = (name: keyof LoginFormData, value: string): string | undefined => {
    try {
      loginSchema.shape[name].parse(value)
      return undefined
    } catch (err) {
      if (err instanceof z.ZodError) {
        return err.errors[0].message
      }
      return 'Invalid input'
    }
  }

  const validateForm = (): boolean => {
    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const fieldErrors: Partial<LoginFormData> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof LoginFormData] = err.message
        }
      })
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    return true
  }



  // =============================================
  // Error Handling
  // =============================================

  const handleAuthError = (error: Error | null): boolean => {
    if (!error) return false

    const message = error.message.toLowerCase()

    if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
      toast.error('Invalid email or password')
      return true
    }

    if (message.includes('email not confirmed') || message.includes('email_not_confirmed')) {
      setShowResend(true)
      setResendEmail(email)
      toast.error('Please check your email and confirm your account')
      return true
    }

    if (message.includes('too many requests') || message.includes('rate limit')) {
      toast.error('Rate limited. Please wait before trying again.')
      return true
    }

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      toast.error('Connection issue. Please try again.')
      return true
    }

    // Sanitize any unexpected errors using handleUIError
    toast.error(handleUIError(error, 'Auth Form'))
    return true
  }

  // =============================================
  // Handlers
  // =============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const formattedEmail = email.includes('@') ? email.trim() : `${email.trim()}@srmist.edu.in`
      const { data, error } = await signIn(formattedEmail, password)

      if (error) {
        handleAuthError(error)
        return
      }

      if (data.user) {
        const appMetadata = data.user.app_metadata as { role?: string }
        const userMetadata = data.user.user_metadata as { role?: string }
        const role = appMetadata?.role ?? userMetadata?.role
        
        if (role) {
          // Use redirect from query params or role-based default
          if (redirectPath) {
            navigate(redirectPath, { replace: true })
          } else {
            redirectToDashboard(role as 'student' | 'faculty' | 'hod' | 'dean')
          }
        } else {
          toast.error("User role not configured. Please contact the administrator.")
        }
      }
    } catch (err) {
      handleAuthError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }



  const handleResendConfirmation = async () => {
    if (!resendEmail) return

    try {
      const { error } = await resendConfirmation(resendEmail)
      if (error) {
        toast.error('Failed to resend confirmation email')
      } else {
        toast.success('Confirmation email sent!')
        setShowResend(false)
      }
    } catch {
      toast.error('Failed to resend confirmation email')
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    const error = validateField('email', e.target.value)
    setErrors((prev) => ({ ...prev, email: error }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    const error = validateField('password', e.target.value)
    setErrors((prev) => ({ ...prev, password: error }))
  }

  // =============================================
  // Render
  // =============================================

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Ambient Mesh Canvas */}
      <div className="app-background" />

      <div className="w-full max-w-md flex flex-col items-center gap-4 relative z-10">
        {envAppType === 'student' ? (
          /* Simplified Student Login Glass Card */
          <div className="w-full rounded-3xl border border-white/90 bg-white/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-5">
                  <img src="/8.-SRM-Logo-300x300.webp" alt="SRM Logo" className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-md" />
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold text-[#001941] tracking-tight">
                  Student Portal Login
                </h1>
                <p className="text-xs text-slate-700 font-bold mt-1">SRMIST Compensatory Course Dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Email or Student ID</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700 h-4 w-4" />
                    <Input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setErrors((prev) => ({ ...prev, email: undefined }))
                      }}
                      placeholder="ID or university email"
                      className={cn('pl-10 bg-white border-2 border-slate-300/90 focus:border-[#001941] focus-visible:ring-4 focus-visible:ring-[#001941]/15 rounded-xl h-12 text-slate-900 font-bold placeholder:text-slate-400 shadow-xs transition-all', errors.email && 'border-red-500 focus-visible:ring-red-500')}
                      disabled={isSubmitting || authLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 font-bold">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      className={cn('pl-10 pr-10 bg-white border-2 border-slate-300/90 focus:border-[#001941] focus-visible:ring-4 focus-visible:ring-[#001941]/15 rounded-xl h-12 text-slate-900 font-bold placeholder:text-slate-400 shadow-xs transition-all', errors.password && 'border-red-500 focus-visible:ring-red-500')}
                      disabled={isSubmitting || authLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#001941] transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 font-bold">{errors.password}</p>
                  )}
                </div>

                {showResend && (
                  <Alert variant="destructive" className="flex gap-2 bg-red-50 border-2 border-red-200">
                    <AlertDescription className="flex-1 text-sm break-words-safe text-red-900 font-bold">
                      Email not confirmed.{' '}
                      <button type="button" onClick={handleResendConfirmation} className="underline font-extrabold">
                        Resend
                      </button>
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full lg-btn-primary rounded-xl h-12 font-bold transition-all mt-2 cursor-pointer shadow-md hover:shadow-lg text-sm"
                  disabled={isSubmitting || authLoading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </div>
          </div>
        ) : (
          /* Faculty & Admin Login Glass Card */
          <div className="w-full rounded-3xl border border-white/90 bg-white/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <div className="p-8 md:p-10">
              {/* Logo + title */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-5">
                  <img src="/8.-SRM-Logo-300x300.webp" alt="SRM Logo" className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-md" />
                </div>
                <h1 className="text-2xl font-extrabold text-[#001941] tracking-tight">
                  {staffTab === 'faculty' ? 'Faculty Portal Login' : 'Admin Portal Login'}
                </h1>
                <p className="text-xs text-slate-700 font-bold mt-1">
                  SRMIST Compensatory Course Dashboard
                </p>
              </div>

              <div>
                {/* Staff Segmented Control */}
                <div className="bg-slate-200/80 p-1.5 rounded-2xl flex gap-1 mb-6 border border-slate-300/70 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setStaffTab('faculty')}
                    className={cn(
                      'flex-1 py-2.5 text-xs md:text-sm font-extrabold text-center rounded-xl transition-all cursor-pointer',
                      staffTab === 'faculty'
                        ? 'bg-[#001941] text-white shadow-md'
                        : 'text-slate-800 hover:text-slate-950 hover:bg-white/60'
                    )}
                  >
                    Faculty
                  </button>
                  <button
                    type="button"
                    onClick={() => setStaffTab('admin')}
                    className={cn(
                      'flex-1 py-2.5 text-xs md:text-sm font-extrabold text-center rounded-xl transition-all cursor-pointer',
                      staffTab === 'admin'
                        ? 'bg-[#001941] text-white shadow-md'
                        : 'text-slate-800 hover:text-slate-950 hover:bg-white/60'
                    )}
                  >
                    Admin (HOD / Dean)
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="you@college.edu"
                        className={cn('pl-10 bg-white border-2 border-slate-300/90 focus:border-[#001941] focus-visible:ring-4 focus-visible:ring-[#001941]/15 rounded-xl h-12 text-slate-900 font-bold placeholder:text-slate-400 shadow-xs transition-all', errors.email && 'border-red-500 focus-visible:ring-red-500')}
                        disabled={isSubmitting || authLoading}
                        autoComplete="email"
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                    </div>
                    {errors.email && (
                      <p id="email-error" className="text-xs text-red-600 font-bold" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700 h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        className={cn('pl-10 pr-10 bg-white border-2 border-slate-300/90 focus:border-[#001941] focus-visible:ring-4 focus-visible:ring-[#001941]/15 rounded-xl h-12 text-slate-900 font-bold placeholder:text-slate-400 shadow-xs transition-all', errors.password && 'border-red-500 focus-visible:ring-red-500')}
                        disabled={isSubmitting || authLoading}
                        autoComplete="current-password"
                        aria-invalid={errors.password ? 'true' : 'false'}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#001941] transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p id="password-error" className="text-xs text-red-600 font-bold" role="alert">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Email Not Confirmed Alert */}
                  {showResend && (
                    <Alert variant="destructive" className="flex gap-2 bg-red-50 border-2 border-red-200">
                      <AlertDescription className="flex-1 text-sm text-red-900 font-bold">
                        Email not confirmed.{' '}
                        <button
                          type="button"
                          onClick={handleResendConfirmation}
                          className="underline hover:no-underline text-sm font-extrabold"
                        >
                          Resend confirmation email
                        </button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full lg-btn-primary rounded-xl h-12 font-bold text-sm transition-all cursor-pointer shadow-md hover:shadow-lg mt-2"
                    disabled={isSubmitting || authLoading}
                    size="default"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  {/* Forgot Password Link */}
                  <p className="text-center text-xs text-slate-600 pt-2 font-bold">
                    <a
                      href="#"
                      className="underline hover:text-[#001941]"
                      onClick={(e) => {
                        e.preventDefault()
                        toast.info('Contact your administrator for password reset')
                      }}
                    >
                      Forgot password?
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}