import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../utils/supabase-types'

// Singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null

/**
 * Get or create the typed Supabase browser client singleton.
 * Uses the Database type from supabase-types.ts for full type safety.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env'
      )
    }

    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: {
          getItem: (key: string) => {
            if (typeof window !== 'undefined') {
              return window.localStorage.getItem(key)
            }
            return null
          },
          setItem: (key: string, value: string) => {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(key, value)
            }
          },
          removeItem: (key: string) => {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem(key)
            }
          },
        },
      },
    })
  }

  return supabaseInstance
}

/**
 * Export the singleton instance directly for convenience.
 * Initializes on first import.
 */
export const supabase = getSupabaseClient()

/**
 * Auth helper functions using the typed client
 */

export async function signIn(email: string, password: string) {
  const client = getSupabaseClient()
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, unknown>
) {
  const client = getSupabaseClient()
  const redirectUrl = import.meta.env.VITE_SITE_URL 
    ? `${import.meta.env.VITE_SITE_URL}/auth/callback`
    : `${window.location.origin}/auth/callback`

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: redirectUrl,
    },
  })
  return { data, error }
}

export async function resendConfirmation(email: string) {
  const client = getSupabaseClient()
  const { data, error } = await client.auth.resend({
    type: 'signup',
    email,
  })
  return { data, error }
}

export async function signOut() {
  const client = getSupabaseClient()
  const { error } = await client.auth.signOut()
  return { error }
}

export async function getSession() {
  const client = getSupabaseClient()
  const { data, error } = await client.auth.getSession()
  return { data, error }
}

export async function getUser() {
  const client = getSupabaseClient()
  const { data, error } = await client.auth.getUser()
  return { data, error }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const client = getSupabaseClient()

  // 1. Get current logged in user
  const { data: userData, error: userError } = await client.auth.getUser()
  if (userError || !userData?.user?.email) {
    return { data: null, error: userError || new Error('User not authenticated') }
  }

  // 2. Re-authenticate with current password to verify current password
  const { error: signInError } = await client.auth.signInWithPassword({
    email: userData.user.email,
    password: currentPassword,
  })

  if (signInError) {
    return { data: null, error: new Error('Current password is incorrect') }
  }

  // 3. Update password in Supabase Auth
  const { data, error: updateError } = await client.auth.updateUser({
    password: newPassword,
  })

  return { data, error: updateError }
}

export function onAuthStateChange(
  callback: (event: string, session: import('@supabase/supabase-js').Session | null) => void
) {
  const client = getSupabaseClient()
  const { data } = client.auth.onAuthStateChange(callback)
  return data.subscription
}

/**
 * React hook to access the typed Supabase client
 */
export function useSupabase(): SupabaseClient<Database> {
  return getSupabaseClient()
}