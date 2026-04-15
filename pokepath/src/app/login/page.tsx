'use client'

import { useState } from 'react'

import { signInWithGoogle } from '@/src/lib/supabase/auth'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSignIn() {
    setError(null)
    setPending(true)
    try {
      const { error: oauthError } = await signInWithGoogle()
      if (oauthError) {
        setError(oauthError.message)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sign in
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Use your Google account to continue.
        </p>
        <button
          type="button"
          onClick={handleSignIn}
          disabled={pending}
          className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? 'Redirecting…' : 'Sign in with Google'}
        </button>
        {error ? (
          <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </main>
    </div>
  )
}
