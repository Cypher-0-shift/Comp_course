import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../../shared/hooks/useAuth'
import { signIn, resendConfirmation, signUp, resetPassword, checkEmailExists } from '../../shared/hooks/useSupabase'
import { toast } from 'sonner'
import { cn } from '../../shared/utils/cn'
import { handleUIError } from '@/shared/utils/error-handler'
// (Card components no longer used in the redesigned institutional UI)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'

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

  const rawRedirect = searchParams.get('redirect') || null
  // Validate: must be a relative internal path (starts with /, not //)
  // Blocks: https://evil.com, //evil.com, javascript:alert(1)
  const redirectPath = rawRedirect && /^\/(?!\/)/.test(rawRedirect) ? rawRedirect : null

  const envAppType = import.meta.env.VITE_APP_TYPE

  // State
  const [staffTab, setStaffTab] = useState<'faculty' | 'admin'>('faculty')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [empId, setEmpId] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [errors, setErrors] = useState<Partial<LoginFormData & { empId?: string, confirmPassword?: string }>>({})



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
    let isValid = true;
    const fieldErrors: Partial<LoginFormData & { empId?: string; confirmPassword?: string }> = {}

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof LoginFormData] = err.message
        }
      })
      isValid = false;
    }

    if (isSignUp && staffTab === 'faculty') {
      if (!empId.trim()) {
        fieldErrors.empId = 'Employee ID is required';
        isValid = false;
      }
      if (password !== confirmPassword) {
        fieldErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    setErrors(fieldErrors)
    return isValid
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
      
      if (isSignUp && staffTab === 'faculty') {
        const { error } = await signUp(formattedEmail, password, {
          role: 'faculty',
          emp_id: empId.trim()
        })
        
        if (error) {
          handleAuthError(error)
          return
        }
        
        toast.success('Account created successfully! Please check your email to verify your account.')
        setIsSignUp(false)
      } else {
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
      }
    } catch (err) {
      handleAuthError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }



  const handleResendConfirmation = async () => {
    try {
      setIsSubmitting(true)
      const formattedEmail = email.includes('@') ? email.trim() : `${email.trim()}@srmist.edu.in`
      const { error } = await resendConfirmation(formattedEmail)
      
      if (error) {
        handleUIError(error, 'Resend Confirmation')
      } else {
        toast.success('Confirmation email sent!', {
          description: `Check your inbox at ${formattedEmail}`,
        })
        setShowResend(false)
      }
    } catch (err: unknown) {
      handleUIError(err, 'Resend Confirmation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address first', {
        description: 'We need your email to send the reset link.',
      })
      return
    }

    try {
      setIsSubmitting(true)
      const formattedEmail = email.includes('@') ? email.trim() : `${email.trim()}@srmist.edu.in`
      
      const emailExists = await checkEmailExists(formattedEmail)
      if (!emailExists) {
        toast.error('No accounts found associated with that email', {
          description: 'Please check the email address and try again.',
        })
        return
      }

      const { error } = await resetPassword(formattedEmail)
      
      if (error) {
        handleUIError(error, 'Password Reset')
      } else {
        toast.success('Password reset link sent!', {
          description: `Check your inbox at ${formattedEmail} for the reset link.`,
        })
        setIsForgotPassword(false)
      }
    } catch (err: unknown) {
      handleUIError(err, 'Password Reset')
    } finally {
      setIsSubmitting(false)
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
    <div className="min-h-screen h-screen max-h-screen flex items-center justify-center px-4 py-2 relative overflow-hidden">
      {/* Animated Ambient Mesh Canvas */}
      <div className="app-background" />

      <div className="w-full max-w-md flex flex-col items-center justify-center relative z-10 my-auto">
        {isForgotPassword ? (
          /* Forgot Password Card */
          <div className="w-full rounded-3xl border border-white/90 bg-white/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="text-center mb-5">
                <div className="flex justify-center mb-3">
                  <img src="/8.-SRM-Logo-300x300.webp" alt="SRM Logo" className="h-14 w-14 md:h-16 md:w-16 object-contain drop-shadow-md" />
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold text-[#001941] tracking-tight">
                  Reset Password
                </h1>
                <p className="text-xs text-slate-700 font-bold mt-1">Enter your email to receive a reset link</p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="reset-email" className="text-[10px] md:text-xs font-extrabold text-slate-900 uppercase tracking-wider">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 h-3.5 w-3.5" />
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="you@college.edu"
                      className={cn('pl-9 bg-white border-2 border-slate-300/90 focus:border-[#001941] focus-visible:ring-4 focus-visible:ring-[#001941]/15 rounded-xl h-10 md:h-11 text-xs md:text-sm text-slate-900 font-bold placeholder:text-slate-400 shadow-xs transition-all', errors.email && 'border-red-500 focus-visible:ring-red-500')}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] text-red-600 font-bold" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full lg-btn-primary rounded-xl h-11 font-bold transition-all mt-1 cursor-pointer shadow-md hover:shadow-lg text-sm"
                  disabled={isSubmitting || !email}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <div className="flex items-center justify-center pt-2">
                  <a
                    href="#"
                    className="text-xs text-slate-600 underline hover:text-[#001941] font-bold"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsForgotPassword(false)
                      setErrors({})
                    }}
                  >
                    ← Back to login
                  </a>
                </div>
              </form>
            </div>
          </div>
        ) : envAppType === 'student' ? (
          /* Simplified Student Login Glass Card */
          <div className="w-full rounded-3xl border border-white/90 bg-white/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="text-center mb-5">
                <div className="flex justify-center mb-3">
                  <img src="/8.-SRM-Logo-300x300.webp" alt="SRM Logo" className="h-14 w-14 md:h-16 md:w-16 object-contain drop-shadow-md" />
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold text-[#001941] tracking-tight">
                  Student Portal Login
                </h1>
                <p className="text-xs text-slate-700 font-bold mt-1">SRMIST Compensatory Course Dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
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
                      className={cn('pl-10 bg-white border-2 border-slate-300/90 focus:border-[#001941] focus-visible:ring-4 focus-visible:ring-[#001941]/15 rounded-xl h-11 text-slate-900 font-bold placeholder:text-slate-400 shadow-xs transition-all text-sm', errors.email && 'border-red-500 focus-visible:ring-red-500')}
                      disabled={isSubmitting || authLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 font-bold">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      className={cn('pl-10 pr-10 bg-white border-2 border-slate-300/90 focus:border-[#001941] focus-visible:ring-4 focus-visible:ring-[#001941]/15 rounded-xl h-11 text-slate-900 font-bold placeholder:text-slate-400 shadow-xs transition-all text-sm', errors.password && 'border-red-500 focus-visible:ring-red-500')}
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
                  <Alert variant="destructive" className="flex gap-2 bg-red-50 border-2 border-red-200 py-2">
                    <AlertDescription className="flex-1 text-xs break-words-safe text-red-900 font-bold">
                      Email not confirmed.{' '}
                      <button type="button" onClick={handleResendConfirmation} className="underline font-extrabold">
                        Resend
                      </button>
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full lg-btn-primary rounded-xl h-11 font-bold transition-all mt-1 cursor-pointer shadow-md hover:shadow-lg text-sm"
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
            <div className={cn('transition-all', isSignUp ? 'p-4 sm:p-5 md:p-6' : 'p-6 md:p-8')}>
              {/* Logo + title */}
              <div className={cn('text-center transition-all', isSignUp ? 'mb-3' : 'mb-5')}>
                <div className={cn('flex justify-center transition-all', isSignUp ? 'mb-1.5' : 'mb-3')}>
                  <img
                    src="/8.-SRM-Logo-300x300.webp"
                    alt="SRM Logo"
                    className={cn('object-contain drop-shadow-md transition-all', isSignUp ? 'h-10 w-10 md:h-12 md:w-12' : 'h-14 w-14 md:h-16 md:w-16')}
                  />
                </div>
                <h1 className={cn('font-extrabold text-[#001941] tracking-tight transition-all', isSignUp ? 'text-lg md:text-xl' : 'text-xl md:text-2xl')}>
                  {isSignUp
                    ? 'Create Faculty Account'
                    : staffTab === 'faculty'
                    ? 'Faculty Portal Login'
                    : 'Admin Portal Login'}
                </h1>
                <p className="text-[11px] md:text-xs text-slate-700 font-bold mt-0.5">
                  SRMIST Compensatory Course Dashboard
                </p>
              </div>

              <div>
                {/* Staff Segmented Control */}
                {!isSignUp && (
                  <div className="bg-slate-200/80 p-1 rounded-2xl flex gap-1 mb-4 border border-slate-300/70 backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => {
                        setStaffTab('faculty')
                        setIsSignUp(false)
                        setErrors({})
                      }}
                      className={cn(
                        'flex-1 py-2 text-xs md:text-sm font-extrabold text-center rounded-xl transition-all cursor-pointer',
                        staffTab === 'faculty'
                          ? 'bg-[#001941] text-white shadow-md'
                          : 'text-slate-800 hover:text-slate-950 hover:bg-white/60'
                      )}
                    >
                      Faculty
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStaffTab('admin')
                        setIsSignUp(false)
                        setErrors({})
                      }}
                      className={cn(
                        'flex-1 py-2 text-xs md:text-sm font-extrabold text-center rounded-xl transition-all cursor-pointer',
                        staffTab === 'admin'
                          ? 'bg-[#001941] text-white shadow-md'
                          : 'text-slate-800 hover:text-slate-950 hover:bg-white/60'
                      )}
                    >
                      Admin
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className={cn('transition-all', isSignUp ? 'space-y-2' : 'space-y-3.5')}>
                  {/* Employee ID Field (Only for Faculty Sign Up) */}
                  {isSignUp && staffTab === 'faculty' && (
                    <div className="space-y-1">
                      <Label htmlFor="empId" className="text-[10px] md:text-xs font-extrabold text-slate-900 uppercase tracking-wider">Employee ID</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 h-3.5 w-3.5" />
                        <Input
                          id="empId"
                          type="text"
                          value={empId}
                          onChange={(e) => {
                            setEmpId(e.target.value)
                            setErrors((prev) => ({ ...prev, empId: undefined }))
                          }}
                          placeholder="Employee ID"
                          className={cn('pl-9 bg-white border-2 border-slate-300/90 focus:border-[#001941] focus-visible:ring-4 focus-visible:ring-[#001941]/15 rounded-xl h-9 md:h-10 text-xs md:text-sm text-slate-900 font-bold placeholder:text-slate-400 shadow-xs transition-all', errors.empId && 'border-red-500 focus-visible:ring-red-500')}
                          disabled={isSubmitting || authLoading}
                        />
                      </div>
                      {errors.empId && (
                        <p className="text-[10px] text-red-600 font-bold" role="alert">
                          {errors.empId}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-[10px] md:text-xs font-extrabold text-slate-900 uppercase tracking-wider">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 h-3.5 w-3.5" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="you@college.edu"
                        className={cn('pl-9 bg-white border-2 border-slate-300/90 focus:border-[#001941] focus-visible:ring-4 focus-visible:ring-[#001941]/15 rounded-xl text-xs md:text-sm text-slate-900 font-bold placeholder:text-slate-400 shadow-xs transition-all', isSignUp ? 'h-9 md:h-10' : 'h-10 md:h-11', errors.email && 'border-red-500 focus-visible:ring-red-500')}
                        disabled={isSubmitting || authLoading}
                        autoComplete="email"
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                    </div>
                    {errors.email && (
                      <p id="email-error" className="text-[10px] text-red-600 font-bold" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-[10px] md:text-xs font-extrabold text-slate-900 uppercase tracking-wider">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 h-3.5 w-3.5" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        className={cn('pl-9 pr-9 bg-white border-2 border-slate-300/90 focus:border-[#001941] focus-visible:ring-4 focus-visible:ring-[#001941]/15 rounded-xl text-xs md:text-sm text-slate-900 font-bold placeholder:text-slate-400 shadow-xs transition-all', isSignUp ? 'h-9 md:h-10' : 'h-10 md:h-11', errors.password && 'border-red-500 focus-visible:ring-red-500')}
                        disabled={isSubmitting || authLoading}
                        autoComplete="current-password"
                        aria-invalid={errors.password ? 'true' : 'false'}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#001941] transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p id="password-error" className="text-[10px] text-red-600 font-bold" role="alert">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field (Only for Faculty Sign Up) */}
                  {isSignUp && staffTab === 'faculty' && (
                    <div className="space-y-1">
                      <Label htmlFor="confirmPassword" className="text-[10px] md:text-xs font-extrabold text-slate-900 uppercase tracking-wider">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 h-3.5 w-3.5" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                          }}
                          placeholder="••••••••"
                          className={cn('pl-9 pr-9 bg-white border-2 border-slate-300/90 focus:border-[#001941] focus-visible:ring-4 focus-visible:ring-[#001941]/15 rounded-xl h-9 md:h-10 text-xs md:text-sm text-slate-900 font-bold placeholder:text-slate-400 shadow-xs transition-all', errors.confirmPassword && 'border-red-500 focus-visible:ring-red-500')}
                          disabled={isSubmitting || authLoading}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-[10px] text-red-600 font-bold" role="alert">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Email Not Confirmed Alert */}
                  {showResend && (
                    <Alert variant="destructive" className="flex gap-2 bg-red-50 border-2 border-red-200 py-1.5 px-3">
                      <AlertDescription className="flex-1 text-xs text-red-900 font-bold">
                        Email not confirmed.{' '}
                        <button
                          type="button"
                          onClick={handleResendConfirmation}
                          className="underline hover:no-underline text-xs font-extrabold"
                        >
                          Resend email
                        </button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className={cn('w-full lg-btn-primary rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer shadow-md hover:shadow-lg mt-1', isSignUp ? 'h-10' : 'h-11')}
                    disabled={isSubmitting || authLoading}
                    size="default"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isSignUp ? 'Creating account...' : 'Signing in...'}
                      </>
                    ) : (
                      isSignUp ? 'Create Account' : 'Sign In'
                    )}
                  </Button>

                  {/* Links */}
                  <div className="flex items-center justify-center gap-3 pt-1">
                    {!isSignUp && (
                      <a
                        href="#"
                        className="text-xs text-slate-600 underline hover:text-[#001941] font-bold"
                        onClick={(e) => {
                          e.preventDefault()
                          setIsForgotPassword(true)
                          setErrors({})
                        }}
                      >
                        Forgot password?
                      </a>
                    )}
                    {staffTab === 'faculty' && (
                      <>
                        {!isSignUp && <span className="text-slate-300">|</span>}
                        <a
                          href="#"
                          className="text-xs text-[#001941] hover:underline font-extrabold"
                          onClick={(e) => {
                            e.preventDefault()
                            setIsSignUp(!isSignUp)
                            setErrors({})
                          }}
                        >
                          {isSignUp ? '← Back to login' : 'Create new account'}
                        </a>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}