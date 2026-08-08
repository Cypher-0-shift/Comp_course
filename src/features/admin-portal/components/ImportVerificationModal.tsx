import { useState } from 'react'
import { ShieldAlert, KeyRound, AlertTriangle, X, CheckCircle2, Loader2 } from 'lucide-react'
import type { ImportType } from '../api/useDataImport'

interface ImportVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (passcode: string) => Promise<void>
  importType: ImportType
  rowCount: number
  isPending: boolean
}

export function ImportVerificationModal({
  isOpen,
  onClose,
  onConfirm,
  importType,
  rowCount,
  isPending,
}: ImportVerificationModalProps) {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const entityName =
    importType === 'departments'
      ? 'Departments'
      : importType === 'faculty'
      ? 'Faculty Assignments'
      : 'Student Enrollments'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!passcode.trim()) {
      setError('Please enter the security verification passcode.')
      return
    }

    try {
      await onConfirm(passcode.trim())
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed'
      setError(msg)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-red-500/30 bg-slate-900 p-6 shadow-2xl ring-1 ring-red-500/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400 ring-1 ring-red-500/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Layer 2 Execution Verification</h3>
              <p className="text-xs text-slate-400">Security authorization required before database commit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Warning Callout Banner */}
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
          <div className="flex items-center gap-2 font-semibold text-amber-300 mb-1 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Permanent Data Replacement Warning</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Executing this import will <strong className="text-amber-100 underline">REPLACE ALL EXISTING RECORDS</strong> in the{' '}
            <strong className="text-amber-100">{entityName}</strong> table with{' '}
            <span className="font-semibold text-white">{rowCount} new valid rows</span>. This action cannot be undone.
          </p>
        </div>

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Enter Admin Security Passcode
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode (e.g. ADMIN123)"
                disabled={isPending}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                autoFocus
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Demo passcode: <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded">ADMIN123</code>
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300 flex items-center gap-2">
              <X className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !passcode.trim()}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-red-950/60 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Verifying & Executing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Confirm & Replace Data</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
