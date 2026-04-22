'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import type { Session } from '@supabase/supabase-js'

import {
  mapInProgressMatches,
  type InProgressMatchListItem,
  type InProgressMatchRow,
  type ProfileUsernameRow,
} from '@/src/lib/match/inProgressMatches'
import { getSession, onAuthStateChange } from '@/src/lib/supabase/auth'
import { supabase } from '@/src/lib/supabase/client'

function formatCreatedAt(createdAt: string | null): string {
  if (!createdAt) return 'Unknown start time'
  const parsed = Date.parse(createdAt)
  if (!Number.isFinite(parsed)) return 'Unknown start time'
  return new Date(parsed).toLocaleString()
}

export default function InProgressGamesPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [items, setItems] = useState<InProgressMatchListItem[]>([])

  useEffect(() => {
    let cancelled = false

    void getSession().then(({ data: { session: s } }) => {
      if (cancelled) return
      setSession(s)
      setReady(true)
      if (!s) {
        router.replace('/login?redirect=/lobby/in-progress')
      }
    })

    const {
      data: { subscription },
    } = onAuthStateChange((_event, s) => {
      setSession(s)
      if (!s) {
        router.replace('/login?redirect=/lobby/in-progress')
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [router])

  useEffect(() => {
    const sessionUserId = session?.user.id
    if (!sessionUserId) return

    let cancelled = false

    void (async () => {
      setLoadingMatches(true)
      setLoadError(null)

      const { data: matchRows, error: matchError } = await supabase
        .from('matches')
        .select('id, player1_id, player2_id, created_at')
        .eq('status', 'in_progress')
        .or(`player1_id.eq.${sessionUserId},player2_id.eq.${sessionUserId}`)

      if (cancelled) return

      if (matchError) {
        setLoadError('Could not load your in-progress games. Please try again.')
        setLoadingMatches(false)
        return
      }

      const typedMatchRows = (matchRows ?? []) as InProgressMatchRow[]
      const opponentIds = typedMatchRows
        .flatMap((row) => {
          if (row.player1_id === sessionUserId) return row.player2_id ? [row.player2_id] : []
          if (row.player2_id === sessionUserId) return row.player1_id ? [row.player1_id] : []
          return []
        })
        .filter((id, index, all) => all.indexOf(id) === index)

      let profileRows: ProfileUsernameRow[] = []
      if (opponentIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', opponentIds)

        if (cancelled) return
        if (profileError) {
          setLoadError('Could not load opponent details. Please refresh and try again.')
          setLoadingMatches(false)
          return
        }
        profileRows = (profiles ?? []) as ProfileUsernameRow[]
      }

      const mapped = mapInProgressMatches({
        sessionUserId,
        matches: typedMatchRows,
        profiles: profileRows,
      })

      setItems(mapped)
      setLoadingMatches(false)
    })()

    return () => {
      cancelled = true
    }
  }, [session?.user.id])

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">In-progress games</h1>
          <Link href="/lobby" className="text-sm font-medium text-emerald-700 underline dark:text-emerald-400">
            Back to lobby
          </Link>
        </div>

        {loadingMatches ? (
          <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">Loading your games...</p>
        ) : null}

        {loadError ? (
          <p className="mt-6 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            {loadError}
          </p>
        ) : null}

        {!loadingMatches && !loadError && items.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">No in-progress games right now.</p>
        ) : null}

        {!loadingMatches && !loadError && items.length > 0 ? (
          <ul className="mt-6 space-y-3">
            {items.map((item) => (
              <li
                key={item.matchId}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Opponent: {item.opponentLabel}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Started: {formatCreatedAt(item.createdAt)}
                    </p>
                  </div>
                  <Link
                    href={`/match/${item.matchId}`}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-700 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600"
                  >
                    Continue
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </main>
    </div>
  )
}
