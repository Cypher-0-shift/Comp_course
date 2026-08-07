import { useLocation } from 'react-router-dom'
import { useAuth } from '../../shared/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, ArrowLeft } from 'lucide-react'

export function AccessDenied() {
  const { role, redirectToDashboard } = useAuth()
  const location = useLocation()

  const from = (location.state as { from?: Location })?.from
  const attemptedPath = from?.pathname || 'Unknown path'

  const handleReturn = () => {
    if (role) {
      redirectToDashboard(role)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">Access Denied</CardTitle>
          <CardDescription>You don't have permission to access this page</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription className="flex flex-col gap-2 text-left">
              <div>
                <strong>Your role:</strong> {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown'}
              </div>
              <div>
                <strong>Attempted path:</strong>
                <code className="ml-2 px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                  {attemptedPath}
                </code>
              </div>
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground text-center">
            This area is restricted to specific roles. You have been redirected based on your assigned role.
          </p>

          <Button
            onClick={handleReturn}
            className="w-full"
            size="default"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}