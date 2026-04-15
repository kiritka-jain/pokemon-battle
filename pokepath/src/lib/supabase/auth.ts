import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

import { supabase } from './client'

/**
 * Starts the Google OAuth flow. Call only from client components.
 * After auth, Supabase redirects to `redirectTo` (default: current origin + `/lobby`).
 */
export function signInWithGoogle(redirectTo?: string) {
  const url =
    redirectTo ??
    (typeof window !== 'undefined' ? `${window.location.origin}/lobby` : undefined)
  if (!url) {
    throw new Error('signInWithGoogle: redirectTo is required outside the browser')
  }
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: url },
  })
}

export function signOut() {
  return supabase.auth.signOut()
}

export function getSession() {
  return supabase.auth.getSession()
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback)
}
