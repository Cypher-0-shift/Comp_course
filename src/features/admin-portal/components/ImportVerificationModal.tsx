import { useState } from 'react'
import { ShieldAlert, KeyRound, AlertTriangle, X, CheckCircle2, Loader2 } from 'lucide-react'
import type { ImportType } from '../api/useDataImport'
import { z } from 'zod'
import { handleUIError } from '@/shared/utils/error-handler'

const passcodeSchema = z.string().length(8, 'Passcode must be exactly 8 characters').regex(/^[A-Z0-9]+$/, 'Passcode must be uppercase alphanumeric characters')

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
    
    const validationResult = passcodeSchema.safeParse(passcode.trim())
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message)
      return
    }

    try {
      await onConfirm(passcode.trim())
    } catch (err: unknown) {
      const msg = handleUIError(err, 'Import Verification Modal')
      setError(msg)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="lg-modal relative w-full max-w-lg p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#001941]">Layer 2 Execution Verification</h3>
              <p className="text-xs text-slate-500">Security authorization required before database commit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="lg-btn-ghost rounded-lg p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Warning Callout Banner */}
        <div className="mt-4 rounded-xl border border-amber-300/80 bg-amber-50/80 p-4 text-amber-900">
          <div className="flex items-center gap-2 font-bold text-amber-900 mb-1 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Permanent Data Replacement Warning</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            Executing this import will <strong className="text-amber-950 underline font-bold">REPLACE ALL EXISTING RECORDS</strong> in the{' '}
            <strong className="text-amber-950">{entityName}</strong> table with{' '}
            <span className="font-bold text-slate-900">{rowCount} new valid rows</span>. This action cannot be undone.
          </p>
        </div>

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
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
                placeholder="Enter security passcode"
                disabled={isPending}
                className="w-full rounded-xl border border-slate-200 bg-white/80 pl-9 pr-4 py-2.5 text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:border-[#001941] focus:outline-none focus:ring-2 focus:ring-[#001941]/20"
                autoFocus
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500 font-medium">
              Passcode is provided by your system administrator.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-300/80 bg-rose-50/80 p-3 text-xs text-rose-700 font-semibold flex items-center gap-2">
              <X className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/70">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="lg-btn-ghost px-4 py-2 text-xs font-semibold text-slate-700 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !passcode.trim()}
              className="lg-btn-destructive flex items-center gap-2 px-4 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
