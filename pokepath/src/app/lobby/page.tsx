'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Session } from '@supabase/supabase-js'

import { EditUsernameModal } from '@/src/components/account/EditUsernameModal'
import { HomePokemonBackdrop } from '@/src/components/home/HomePokemonBackdrop'
import { useMatchmakingPresencePreview } from '@/src/lib/matchmaking/useMatchmakingPresencePreview'
import { eloTierLabel } from '@/src/lib/profile/eloTier'
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

function loadingShell(message: string) {
  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-amber-50 via-zinc-50 to-emerald-50 px-6 py-12 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <HomePokemonBackdrop />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-amber-50/40 via-zinc-50/38 to-emerald-50/42 dark:from-zinc-950/48 dark:via-black/40 dark:to-zinc-900/48"
        aria-hidden
      />
      <p className="relative z-10 text-zinc-600 dark:text-zinc-400">{message}</p>
    </div>
  )
}

export default function LobbyPage() {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [profile, setProfile] = useState<{ username: string; elo_rating: number } | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [inProgressCount, setInProgressCount] = useState<number | null>(null)
  const [editUsernameOpen, setEditUsernameOpen] = useState(false)
  const [editUsernameModalKey, setEditUsernameModalKey] = useState(0)

  const { onlineCount, searchingCount, subscribed: presenceSubscribed } =
    useMatchmakingPresencePreview(session?.user.id, profile)

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
    void (async () => {
      setProfileLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('username, elo_rating')
        .eq('id', session.user.id)
        .maybeSingle()
      if (cancelled) return
      setProfileLoading(false)
      if (data && !error) {
        setProfile({ username: data.username, elo_rating: data.elo_rating })
      } else {
        setProfile({ username: '', elo_rating: 1200 })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session?.user.id])

  useEffect(() => {
    const sessionUserId = session?.user.id
    if (!sessionUserId) return
    let cancelled = false

    void (async () => {
      const { data: rows, error } = await supabase
        .from('matches')
        .select('id')
        .eq('status', 'in_progress')
        .or(`player1_id.eq.${sessionUserId},player2_id.eq.${sessionUserId}`)

      if (cancelled) return
      if (error) {
        setInProgressCount(0)
        return
      }
      setInProgressCount(rows?.length ?? 0)
    })()

    return () => {
      cancelled = true
    }
  }, [session?.user.id])

  const handleSignOut = useCallback(async () => {
    await signOut()
    router.push('/login')
  }, [router])

  const greetingName = useMemo(() => {
    if (!session) return ''
    const u = profile?.username?.trim()
    if (u) return u
    return displayName(session)
  }, [profile?.username, session])

  if (!ready) {
    return loadingShell('Loading…')
  }

  if (!session) {
    return loadingShell('Redirecting…')
  }

  const tier =
    profile != null && Number.isFinite(profile.elo_rating)
      ? eloTierLabel(profile.elo_rating)
      : null

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-amber-50 via-zinc-50 to-emerald-50 px-6 py-16 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <HomePokemonBackdrop />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-amber-50/40 via-zinc-50/38 to-emerald-50/42 dark:from-zinc-950/48 dark:via-black/40 dark:to-zinc-900/48"
        aria-hidden
      />

      <motion.main
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/30 bg-white/[0.11] p-8 shadow-[0_6px_28px_rgba(0,0,0,0.04)] backdrop-blur-sm backdrop-saturate-150 dark:border-white/[0.08] dark:bg-zinc-950/[0.14] dark:shadow-[0_6px_28px_rgba(0,0,0,0.25)]"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300/90">
          Welcome back, {greetingName}
        </p>

        <div className="mt-3 flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Lobby</h1>
          <Link
            href="/leaderboard"
            className="text-sm font-medium text-emerald-700 underline dark:text-emerald-400"
          >
            Leaderboard
          </Link>
        </div>

        <div
          className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400"
          aria-live="polite"
        >
          {inProgressCount != null && inProgressCount > 0 ? (
            <Link
              href="/lobby/in-progress"
              className="font-medium text-emerald-800 underline dark:text-emerald-300"
            >
              {inProgressCount} active {inProgressCount === 1 ? 'game' : 'games'}
            </Link>
          ) : null}
          {inProgressCount != null && inProgressCount > 0 ? (
            <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
              ·
            </span>
          ) : null}
          <span>
            {presenceSubscribed ? (
              <>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {searchingCount}
                </span>{' '}
                in queue ·{' '}
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {onlineCount}
                </span>{' '}
                online
              </>
            ) : (
              <span className="text-zinc-500 dark:text-zinc-500">Connecting…</span>
            )}
          </span>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">Name</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">{displayName(session)}</dd>
          </div>
          <div>
            <dt className="flex items-center justify-between gap-2 font-medium text-zinc-500 dark:text-zinc-400">
              <span>Username</span>
              <button
                type="button"
                onClick={() => {
                  setEditUsernameModalKey((n) => n + 1)
                  setEditUsernameOpen(true)
                }}
                disabled={profileLoading || !profile}
                className="font-normal text-emerald-700 underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50 dark:text-emerald-400"
              >
                Edit
              </button>
            </dt>
            <dd className="text-zinc-900 dark:text-zinc-100">
              {profileLoading ? (
                <span className="inline-block h-4 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              ) : profile?.username?.trim() ? (
                profile.username
              ) : (
                <span className="text-zinc-500 dark:text-zinc-400">
                  — <span className="text-xs">(choose a trainer name)</span>
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">Elo</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">
              {profileLoading ? (
                <span className="inline-block h-4 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              ) : profile != null && Number.isFinite(profile.elo_rating) ? (
                <>
                  {profile.elo_rating}{' '}
                  <span className="text-zinc-500 dark:text-zinc-400">({tier})</span>
                </>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">Email</dt>
            <dd className="text-zinc-900 dark:text-zinc-100">
              {session.user.email ?? '—'}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3">
          <p className="text-center text-xs text-zinc-600 dark:text-zinc-400">
            Queue for a rated online match. Both players must tap search on the next screen.
          </p>
          <Link
            href="/lobby/find-match"
            className="flex h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-medium text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600"
          >
            Find a match
          </Link>
          <Link
            href="/lobby/in-progress"
            className="flex h-12 w-full items-center justify-center rounded-full border border-zinc-300/70 bg-white/35 px-5 text-sm font-medium text-zinc-900 backdrop-blur-sm transition-colors hover:bg-white/55 dark:border-zinc-600 dark:bg-zinc-950/35 dark:text-zinc-100 dark:hover:bg-zinc-900/55"
          >
            In-progress games
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-zinc-200/60 pt-6 dark:border-zinc-700/60">
          <Link
            href="/play/vs-computer"
            className="flex min-h-[4.5rem] flex-col items-center justify-center rounded-xl border border-zinc-300/70 bg-white/28 px-3 py-3 text-center text-sm font-medium text-emerald-800 backdrop-blur-sm transition-colors hover:bg-white/45 dark:border-zinc-600 dark:bg-zinc-950/28 dark:text-emerald-300 dark:hover:bg-zinc-900/50"
          >
            <span aria-hidden className="mb-1 text-lg">
              🤖
            </span>
            Practice vs computer
          </Link>
          <Link
            href="/play"
            className="flex min-h-[4.5rem] flex-col items-center justify-center rounded-xl border border-zinc-300/70 bg-white/28 px-3 py-3 text-center text-sm font-medium text-zinc-800 backdrop-blur-sm transition-colors hover:bg-white/45 dark:border-zinc-600 dark:bg-zinc-950/28 dark:text-zinc-100 dark:hover:bg-zinc-900/50"
          >
            <span aria-hidden className="mb-1 text-lg">
              👥
            </span>
            Local pass-and-play
          </Link>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-full border border-zinc-300/70 bg-white/22 px-5 text-sm font-medium text-zinc-900 backdrop-blur-sm transition-colors hover:bg-white/40 dark:border-zinc-600 dark:bg-zinc-950/22 dark:text-zinc-100 dark:hover:bg-zinc-900/45"
        >
          Sign out
        </button>

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
      </motion.main>
    </div>
  )
}
