import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'

/**
 * PWA Update Prompt
 * Shows a subtle banner at the bottom of the screen when a new version
 * of the app is available, prompting the user to reload.
 */
export function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every 60 minutes in production
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000)
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error)
    },
  })

  useEffect(() => {
    if (needRefresh) {
      setShowPrompt(true)
    }
  }, [needRefresh])

  if (!showPrompt) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#001941] text-white shadow-2xl border border-white/10 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300"
    >
      <RefreshCw className="w-4 h-4 shrink-0 text-blue-300" />
      <p className="text-sm font-semibold">A new version is available</p>
      <button
        onClick={() => updateServiceWorker(true)}
        className="text-xs bg-white text-[#001941] font-bold px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
      >
        Update
      </button>
      <button
        onClick={() => { setNeedRefresh(false); setShowPrompt(false) }}
        className="text-white/60 hover:text-white transition-colors cursor-pointer"
        aria-label="Dismiss update prompt"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
