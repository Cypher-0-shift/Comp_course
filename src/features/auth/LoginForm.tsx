import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../../shared/hooks/useAuth'
import { signIn, resendConfirmation } from '../../shared/hooks/useSupabase'
import { toast } from 'sonner'
import { cn } from '../../shared/utils/cn'
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
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'

// =============================================
// Zod Validation Schema
// =============================================

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// =============================================
// LoginForm Component
// =============================================

export function LoginForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { redirectToDashboard, isLoading: authLoading } = useAuth()

  // State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [errors, setErrors] = useState<Partial<LoginFormData>>({})

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

    toast.error(error.message || 'An unexpected error occurred')
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
        const { role } = data.user.app_metadata as { role?: string }
        if (role) {
          // Use redirect from query params or role-based default
          if (redirectPath) {
            navigate(redirectPath, { replace: true })
          } else {
            redirectToDashboard(role as 'student' | 'faculty' | 'hod' | 'dean')
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
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>

        <CardContent>
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
              className="w-full"
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
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>Compensatory Course Dashboard</p>
        </CardFooter>
      </Card>
    </div>
  )
}