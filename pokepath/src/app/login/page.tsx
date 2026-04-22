'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { getSession, onAuthStateChange, signInWithGoogle } from '@/src/lib/supabase/auth'

function LoginFallback() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Checking session...</p>
    </div>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [ready, setReady] = useState(false)

  const redirectPath = useMemo(() => {
    const raw = searchParams.get('redirect')?.trim()
    if (!raw || !raw.startsWith('/')) return '/lobby'
    return raw
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    void getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session) {
        router.replace(redirectPath)
        return
      }
      setReady(true)
    })

    const {
      data: { subscription },
    } = onAuthStateChange((_event, session) => {
      if (session) {
        router.replace(redirectPath)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [redirectPath, router])

  async function handleSignIn() {
    setError(null)
    setPending(true)
    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}${redirectPath}`
          : undefined
      const { error: oauthError } = await signInWithGoogle(redirectTo)
      if (oauthError) {
        setError(oauthError.message)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed')
    } finally {
      setPending(false)
    }
  }

  if (!ready) {
    return <LoginFallback />
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

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  )
}
