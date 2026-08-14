import React, { useState } from 'react'
import { KeyRound, Eye, EyeOff, X, Check, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import { toast } from 'sonner'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { changePassword, signOut } = useAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  // Password Validation Criteria
  const hasMinLength = newPassword.length >= 8
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasLowercase = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const isMatching = newPassword !== '' && newPassword === confirmPassword
  const isDifferentFromCurrent = newPassword === '' || currentPassword === '' || newPassword !== currentPassword

  const isValid =
    currentPassword.trim().length > 0 &&
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    isMatching &&
    isDifferentFromCurrent

  const handleReset = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
    setErrorMsg(null)
  }

  const handleClose = () => {
    if (isSubmitting) return
    handleReset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.')
      return
    }

    if (!isValid) {
      if (!isMatching) {
        setErrorMsg('New password and confirm password do not match.')
      } else if (!isDifferentFromCurrent) {
        setErrorMsg('New password must be different from current password.')
      } else {
        setErrorMsg('Please ensure your new password meets all security requirements.')
      }
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await changePassword(currentPassword, newPassword)
      if (error) {
        setErrorMsg(error.message || 'Failed to update password. Please try again.')
      } else {
        toast.success('Password updated successfully!', {
          description: 'Please log in again with your new password.',
        })
        handleReset()
        onClose()
        
        setTimeout(async () => {
          await signOut()
        }, 1500)
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-150 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6 border-b border-slate-100 pb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#001941]/10 text-[#001941] border border-[#001941]/20 shadow-xs">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#001941] tracking-tight">Change Password</h2>
            <p className="text-xs font-medium text-slate-500">Update your portal login credentials</p>
          </div>
        </div>

        {/* Error Callout Banner */}
        {errorMsg && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-700 font-semibold flex items-start gap-2.5 shadow-2xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                disabled={isSubmitting}
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-3.5 pr-10 py-2.5 text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:border-[#001941] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001941]/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={isSubmitting}
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-3.5 pr-10 py-2.5 text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:border-[#001941] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001941]/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                disabled={isSubmitting}
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-3.5 pr-10 py-2.5 text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:border-[#001941] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001941]/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password Strength / Requirements Checklist */}
          {newPassword.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs space-y-1.5">
              <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-2">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                  <Check className={`h-3.5 w-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                  <Check className={`h-3.5 w-3.5 ${hasUppercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>1 uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                  <Check className={`h-3.5 w-3.5 ${hasLowercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>1 lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                  <Check className={`h-3.5 w-3.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>1 number</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isMatching ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                  <Check className={`h-3.5 w-3.5 ${isMatching ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Passwords match</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isDifferentFromCurrent ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                  <Check className={`h-3.5 w-3.5 ${isDifferentFromCurrent ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Different from current</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#001941] text-white text-xs font-bold shadow-md hover:bg-[#002866] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-white" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
