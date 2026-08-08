import { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth error caught by boundary:', error)
    console.error('Component stack:', errorInfo.componentStack)

    // Clear any potentially corrupted session data
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('ccd_sessions')
        sessionStorage.removeItem('ccd_tab_id')
      } catch {
        // Ignore storage errors
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoToLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/login?error=session_corrupted'
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold">Something went wrong</CardTitle>
              <CardDescription>
                An authentication error occurred. Please try signing in again.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription className="text-left">
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    {import.meta.env.DEV
                      ? this.state.error?.message || 'Unknown error'
                      : 'An unexpected authentication error occurred. Please try signing in again.'}
                  </pre>
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoToLogin}
                  className="flex-1"
                >
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}