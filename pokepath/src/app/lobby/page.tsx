'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import type { Session } from '@supabase/supabase-js'

import { EditUsernameModal } from '@/src/components/account/EditUsernameModal'
import {
  getSession,
  onAuthStateChange,
  signOut,
} from '@/src/lib/supabase/auth'
import { supabase } from '@/src/lib/supabase/client'

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
  const [profile, setProfile] = useState<{ username: string; elo_rating: number } | null>(null)
  const [editUsernameOpen, setEditUsernameOpen] = useState(false)
  const [editUsernameModalKey, setEditUsernameModalKey] = useState(0)

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

  useEffect(() => {
    if (!session?.user.id) return
    let cancelled = false
    void supabase
      .from('profiles')
      .select('username, elo_rating')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return
        setProfile({ username: data.username, elo_rating: data.elo_rating })
      })
    return () => {
      cancelled = true
    }
  }, [session?.user.id])

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
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Lobby</h1>
          <Link
            href="/leaderboard"
            className="text-sm font-medium text-emerald-700 underline dark:text-emerald-400"
          >
            Leaderboard
          </Link>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">Name</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{displayName(session)}</dd>
          </div>
          <div>
            <dt className="flex items-center justify-between gap-2 font-medium text-zinc-500 dark:text-zinc-400">
              <span>Username</span>
              {/* Epic 2 / ticket 2.3: single entry point for editing `profiles.username`. */}
              <button
                type="button"
                onClick={() => {
                  setEditUsernameModalKey((n) => n + 1)
                  setEditUsernameOpen(true)
                }}
                disabled={!profile}
                className="font-normal text-emerald-700 underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50 dark:text-emerald-400"
              >
                Edit
              </button>
            </dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{profile?.username ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">Elo</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{profile?.elo_rating ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">Email</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">
              {session.user.email ?? '—'}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/lobby/find-match"
            className="flex h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-medium text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600"
          >
            Find a match
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <Link
            href="/play"
            className="text-center text-sm text-zinc-600 underline dark:text-zinc-400"
          >
            Local practice board
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex h-12 w-full items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Sign out
          </button>
        </div>

        {editUsernameOpen ? (
          <EditUsernameModal
            key={editUsernameModalKey}
            initialUsername={profile?.username ?? ''}
            onClose={() => setEditUsernameOpen(false)}
            onSaved={(username) => {
              setProfile((p) =>
                p ? { ...p, username } : { username, elo_rating: 1200 },
              )
            }}
          />
        ) : null}
      </main>
    </div>
  )
}
