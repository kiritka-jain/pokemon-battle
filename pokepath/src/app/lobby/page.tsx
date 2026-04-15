'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import type { Session } from '@supabase/supabase-js'

import {
  getSession,
  onAuthStateChange,
  signOut,
} from '@/src/lib/supabase/auth'

function displayName(session: Session): string {
  const meta = session.user.user_metadata as Record<string, unknown> | undefined
  const fullName =
    (typeof meta?.full_name === 'string' && meta.full_name) ||
    (typeof meta?.name === 'string' && meta.name)
  if (fullName) return fullName
  return session.user.email ?? 'Signed-in user'
}

export default function LobbyPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    void getSession().then(({ data: { session: s } }) => {
      if (cancelled) return
      setSession(s)
      setReady(true)
      if (!s) {
        router.replace('/login')
      }
    })

    const {
      data: { subscription },
    } = onAuthStateChange((_event, s) => {
      setSession(s)
      if (!s) {
        router.replace('/login')
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [router])

  const handleSignOut = useCallback(async () => {
    await signOut()
    router.push('/login')
  }, [router])

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">Loading…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">Redirecting…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Lobby
        </h1>
        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">Name</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{displayName(session)}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">Email</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">
              {session.user.email ?? '—'}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-8 flex h-12 w-full items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Sign out
        </button>
      </main>
    </div>
  )
}
