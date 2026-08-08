import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '../providers/AuthProvider'
import { BrowserRouter } from 'react-router-dom'
import { router } from '../routes/router'
import { AuthErrorBoundary } from '@/components/AuthErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000,
    },
  },
})

export function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" richColors />
          <AuthErrorBoundary>
            {router}
          </AuthErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}