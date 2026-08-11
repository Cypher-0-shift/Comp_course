import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '../providers/AuthProvider'
import { BrowserRouter } from 'react-router-dom'
import { router } from '../routes/router'
import { AuthErrorBoundary } from '@/components/AuthErrorBoundary'
import { PWAUpdatePrompt } from '@/components/PWAUpdatePrompt'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes — no re-fetch within this window
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 24 hours
      gcTime: 24 * 60 * 60 * 1000,
      // Retry failed requests up to 2 times with exponential backoff
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      // Don't refetch when user switches tabs — student data doesn't change that often
      refetchOnWindowFocus: false,
      // Do refetch if network reconnects (important for offline recovery)
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
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
          {/* PWA update notification banner */}
          <PWAUpdatePrompt />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}