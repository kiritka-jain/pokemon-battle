'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { Session } from '@supabase/supabase-js'

import {
  getSession,
  onAuthStateChange,
  signOut,
} from '@/src/lib/supabase/auth'
import { supabase } from '@/src/lib/supabase/client'

type ProfileRow = {
  username: string
  elo_rating: number
}

function displayName(session: Session): string {
  const meta = session.user.user_metadata as Record<string, unknown> | undefined
  const fullName =
    (typeof meta?.full_name === 'string' && meta.full_name) ||
    (typeof meta?.name === 'string' && meta.name)
  if (fullName) return fullName
  return session.user.email ?? 'Signed-in user'
}

type SignalPayload =
  | { type: 'QUEUE'; userId: string; elo: number }
  | { type: 'DEQUEUE'; userId: string }
  | { type: 'MATCH_FOUND'; matchId: string; player1Id: string; player2Id: string }

export default function LobbyPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [searching, setSearching] = useState(false)
  const [queueError, setQueueError] = useState<string | null>(null)

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const queueMapRef = useRef<Map<string, number>>(new Map())
  const pairIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pairingRef = useRef(false)
  const sessionRef = useRef<Session | null>(null)
  const profileRef = useRef<ProfileRow | null>(null)

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  useEffect(() => {
    profileRef.current = profile
  }, [profile])

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
        setProfile({
          username: data.username,
          elo_rating: data.elo_rating,
        })
      })
    return () => {
      cancelled = true
    }
  }, [session?.user.id])

  const cleanupChannel = useCallback(() => {
    if (pairIntervalRef.current) {
      clearInterval(pairIntervalRef.current)
      pairIntervalRef.current = null
    }
    const ch = channelRef.current
    channelRef.current = null
    if (ch) {
      void supabase.removeChannel(ch)
    }
    pairingRef.current = false
  }, [])

  useEffect(() => {
    if (!searching || !session?.user.id) return

    const uid = session.user.id
    const elo = profileRef.current?.elo_rating ?? 1200
    queueMapRef.current.set(uid, elo)

    const ch = supabase.channel('matchmaking', {
      config: { broadcast: { self: true } },
    })
    channelRef.current = ch

    ch.on(
      'broadcast',
      { event: 'signal' },
      ({ payload }: { payload: SignalPayload | Record<string, unknown> }) => {
        const p = payload as SignalPayload
        if (p.type === 'QUEUE') {
          queueMapRef.current.set(p.userId, p.elo)
        }
        if (p.type === 'DEQUEUE') {
          queueMapRef.current.delete(p.userId)
        }
        if (p.type === 'MATCH_FOUND') {
          if (p.player1Id === uid || p.player2Id === uid) {
            cleanupChannel()
            setSearching(false)
            queueMapRef.current.clear()
            router.push(`/match/${p.matchId}`)
          }
        }
      },
    )

    void ch.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return
      await ch.send({
        type: 'broadcast',
        event: 'signal',
        payload: {
          type: 'QUEUE',
          userId: uid,
          elo,
        } satisfies SignalPayload as unknown as Record<string, unknown>,
      })
    })

    const tryPair = async () => {
      const s = sessionRef.current
      if (!s?.user?.id || pairingRef.current) return
      const ids = [...queueMapRef.current.keys()].sort((a, b) => a.localeCompare(b))
      if (ids.length < 2) return

      const player1Id = ids[0]
      const player2Id = ids[1]
      if (s.user.id !== player1Id) return

      pairingRef.current = true

      const {
        data: { session: fresh },
      } = await getSession()
      const token = fresh?.access_token
      if (!token) {
        pairingRef.current = false
        return
      }

      const res = await fetch(`${window.location.origin}/api/match/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ player1Id, player2Id }),
      })

      const json = (await res.json()) as { matchId?: string; error?: string }
      if (!res.ok || !json.matchId) {
        setQueueError(json.error ?? 'Could not create match')
        pairingRef.current = false
        return
      }

      const found: SignalPayload = {
        type: 'MATCH_FOUND',
        matchId: json.matchId,
        player1Id,
        player2Id,
      }

      await ch.send({
        type: 'broadcast',
        event: 'signal',
        payload: found as unknown as Record<string, unknown>,
      })

      cleanupChannel()
      setSearching(false)
      queueMapRef.current.clear()
      router.push(`/match/${json.matchId}`)
    }

    pairIntervalRef.current = setInterval(() => {
      void tryPair()
    }, 600)

    return () => {
      cleanupChannel()
    }
  }, [cleanupChannel, router, searching, session?.user.id])

  const handleFindMatch = useCallback(() => {
    setQueueError(null)
    setSearching(true)
  }, [])

  const handleCancelSearch = useCallback(() => {
    const uid = sessionRef.current?.user.id
    if (uid) {
      queueMapRef.current.delete(uid)
      const ch = channelRef.current
      if (ch) {
        void ch.send({
          type: 'broadcast',
          event: 'signal',
          payload: { type: 'DEQUEUE', userId: uid } satisfies SignalPayload as unknown as Record<
            string,
            unknown
          >,
        })
      }
    }
    cleanupChannel()
    setSearching(false)
  }, [cleanupChannel])

  const handleSignOut = useCallback(async () => {
    handleCancelSearch()
    await signOut()
    router.push('/login')
  }, [handleCancelSearch, router])

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
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">Username</dt>
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
          {!searching ? (
            <button
              type="button"
              onClick={handleFindMatch}
              className="flex h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-medium text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600"
            >
              Find match
            </button>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-6 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent dark:border-emerald-400"
                aria-hidden
              />
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                Searching…
              </p>
              <button
                type="button"
                onClick={handleCancelSearch}
                className="mt-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {queueError ? (
          <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400" role="alert">
            {queueError}
          </p>
        ) : null}

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
      </main>
    </div>
  )
}
