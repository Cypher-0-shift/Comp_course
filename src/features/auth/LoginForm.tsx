import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../../shared/hooks/useAuth'
import { signIn, resendConfirmation, signUp, getSupabaseClient } from '../../shared/hooks/useSupabase'
import { toast } from 'sonner'
import { cn } from '../../shared/utils/cn'
import { handleUIError } from '@/shared/utils/error-handler'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff, UserCheck } from 'lucide-react'

// =============================================
// Zod Validation Schema
// =============================================

const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password too long')
    .regex(/^[a-zA-Z0-9!@#$%^&*()_+=\-{}[\]:;"'<>,.?/`~|\\]+$/, 'Invalid characters in password'),
})

const onboardSchema = z.object({
  empId: z.string().min(1, 'Employee ID is required').max(20, 'Employee ID too long'),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password too long')
    .regex(/^[a-zA-Z0-9!@#$%^&*()_+=\-{}[\]:;"'<>,.?/`~|\\]+$/, 'Invalid characters in password'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type OnboardFormData = z.infer<typeof onboardSchema>

// =============================================
// LoginForm Component
// =============================================

export function LoginForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { redirectToDashboard, isLoading: authLoading } = useAuth()

  // State
  const [activeTab, setActiveTab] = useState<'login' | 'onboard'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [errors, setErrors] = useState<Partial<LoginFormData>>({})

  // Onboard State
  const [empId, setEmpId] = useState('')
  const [onboardEmail, setOnboardEmail] = useState('')
  const [onboardPassword, setOnboardPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [onboardErrors, setOnboardErrors] = useState<Partial<Record<keyof OnboardFormData | 'root', string>>>({})

  // Get redirect path from query params
  const redirectPath = searchParams.get('redirect') || null

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

  const validateOnboardForm = (): boolean => {
    const result = onboardSchema.safeParse({ empId, email: onboardEmail, password: onboardPassword, confirmPassword })
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof OnboardFormData, string>> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof OnboardFormData] = err.message
        }
      })
      setOnboardErrors(fieldErrors)
      return false
    }
    setOnboardErrors({})
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
      const { data, error } = await signIn(email, password)

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

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateOnboardForm()) return

    setIsSubmitting(true)

    try {
      const client = getSupabaseClient()
      
      // Query security definer RPC to verify the emp_id securely without admin keys
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: onboardingData, error: searchError } = await (client as any)
        .rpc('verify_and_get_faculty_onboarding', {
          p_emp_id: empId.toUpperCase().trim()
        })

      if (searchError) {
        toast.error('Error verifying Employee ID: ' + searchError.message)
        return
      }

      if (!onboardingData || onboardingData.length === 0) {
        setOnboardErrors({ empId: 'Employee ID not found in assignments. Please contact the administrator.' })
        toast.error('Onboarding failed: Employee ID not found.')
        return
      }

      // Check if this emp_id is already onboarded by looking for users in auth or matching emails
      const facultyName = onboardingData[0].faculty_name
      const departmentName = onboardingData[0].department

      const { data: signUpData, error: signUpError } = await signUp(onboardEmail, onboardPassword, {
        role: 'faculty',
        emp_id: empId.toUpperCase().trim(),
        name: facultyName,
        department_name: departmentName
      })

      if (signUpError) {
        handleAuthError(signUpError)
        return
      }

      if (signUpData.user) {
        toast.success(`Welcome, ${facultyName}! Onboarding successful. Check your email for verification.`)
        // Clear onboarding form
        setEmpId('')
        setOnboardEmail('')
        setOnboardPassword('')
        setConfirmPassword('')
        setActiveTab('login')
      }
    } catch (err) {
      toast.error('An unexpected error occurred during onboarding: ' + (err instanceof Error ? err.message : String(err)))
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-24 h-24 flex items-center justify-center mb-2">
            <img src="/8.-SRM-Logo-300x300.webp" alt="SRM Logo" className="h-full w-full object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {activeTab === 'login' ? 'Sign In' : 'Onboard Faculty'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'login'
              ? 'Enter your credentials to access the dashboard'
              : 'Enter details to map your assigned courses & onboard'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Tab Switcher */}
          <div className="flex border-b mb-6 border-slate-200">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrors({}); setOnboardErrors({}); }}
              className={cn(
                'flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-all cursor-pointer',
                activeTab === 'login'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('onboard'); setErrors({}); setOnboardErrors({}); }}
              className={cn(
                'flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-all cursor-pointer',
                activeTab === 'onboard'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              )}
            >
              Onboard Faculty
            </button>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="you@college.edu"
                    className={cn('pl-9', errors.email && 'border-red-500 focus-visible:ring-red-500')}
                    disabled={isSubmitting || authLoading}
                    autoComplete="email"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-500" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className={cn('pl-9 pr-10', errors.password && 'border-red-500 focus-visible:ring-red-500')}
                    disabled={isSubmitting || authLoading}
                    autoComplete="current-password"
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-500" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Email Not Confirmed Alert */}
              {showResend && (
                <Alert variant="destructive" className="flex gap-2">
                  <AlertDescription className="flex-1 text-sm">
                    Email not confirmed.{' '}
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      className="underline hover:no-underline text-sm"
                    >
                      Resend confirmation email
                    </button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
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
              <p className="text-center text-sm text-muted-foreground pt-2">
                <a
                  href="#"
                  className="underline hover:no-underline"
                  onClick={(e) => {
                    e.preventDefault()
                    toast.info('Contact your administrator for password reset')
                  }}
                >
                  Forgot password?
                </a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              {/* Employee ID Field */}
              <div className="space-y-1.5">
                <Label htmlFor="empId">Employee ID</Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="empId"
                    type="text"
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    placeholder="e.g. T947"
                    className={cn('pl-9 uppercase', onboardErrors.empId && 'border-red-500 focus-visible:ring-red-500')}
                    disabled={isSubmitting}
                    autoComplete="off"
                  />
                </div>
                {onboardErrors.empId && (
                  <p className="text-sm text-red-500" role="alert">
                    {onboardErrors.empId}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="onboardEmail">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="onboardEmail"
                    type="email"
                    value={onboardEmail}
                    onChange={(e) => setOnboardEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className={cn('pl-9', onboardErrors.email && 'border-red-500 focus-visible:ring-red-500')}
                    disabled={isSubmitting}
                  />
                </div>
                {onboardErrors.email && (
                  <p className="text-sm text-red-500" role="alert">
                    {onboardErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="onboardPassword">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="onboardPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={onboardPassword}
                    onChange={(e) => setOnboardPassword(e.target.value)}
                    placeholder="••••••••"
                    className={cn('pl-9 pr-10', onboardErrors.password && 'border-red-500 focus-visible:ring-red-500')}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {onboardErrors.password && (
                  <p className="text-sm text-red-500" role="alert">
                    {onboardErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={cn('pl-9', onboardErrors.confirmPassword && 'border-red-500 focus-visible:ring-red-500')}
                    disabled={isSubmitting}
                  />
                </div>
                {onboardErrors.confirmPassword && (
                  <p className="text-sm text-red-500" role="alert">
                    {onboardErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Onboard Button */}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                disabled={isSubmitting}
                size="default"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Onboarding Faculty...
                  </>
                ) : (
                  'Complete Onboarding'
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>Compensatory Course Dashboard</p>
        </CardFooter>
      </Card>
    </div>
  )
}