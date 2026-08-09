/**
 * A custom error class intended to wrap explicit messages that are completely safe
 * to display to end-users (e.g., custom validation logic).
 */
export class SafeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SafeError'
  }
}

/**
 * Handles errors caught across the application by parsing them to ensure
 * raw internal data is stripped from UI displays.
 * 
 * @param error The unknown error caught
 * @param context A string context for the console log (e.g., "Login", "Import Data")
 * @returns A safe, generic error string for the UI.
 */
export function handleUIError(error: unknown, context: string): string {
  // Always log the full, raw error to the console or server log aggregator
  console.error(`[Error: ${context}]`, error)

  // Explicitly safe errors can be displayed directly
  if (error instanceof SafeError) {
    return error.message
  }

  // Handle Supabase Auth errors specifically (they are safe to display and should not be masked)
  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>
    const name = errObj.name
    const hasStatus = 'status' in errObj
    const isAuthName =
      typeof name === 'string' &&
      (name.includes('AuthError') ||
        name.includes('AuthApiError') ||
        name.includes('AuthWeakPasswordError'))

    if (hasStatus || isAuthName) {
      const message = errObj.message
      if (typeof message === 'string') {
        return message
      }
    }
  }

  // Handle Supabase / PostgREST errors specifically (they often contain `.code` or `.details`)
  if (typeof error === 'object' && error !== null && ('code' in error || 'details' in error)) {
    return 'A database or service operation failed. Please try again later.'
  }

  // Handle standard JS errors
  if (error instanceof Error) {
    return 'An unexpected application error occurred. Please contact support if this persists.'
  }

  // Fallback
  return 'An unknown error occurred.'
}
