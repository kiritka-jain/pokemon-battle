'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { Session } from '@supabase/supabase-js'

import {
  parsePresencePlayers,
  searchingUserIds,
  type PresencePlayer,
} from '@/src/lib/matchmaking/presenceHelpers'
import { getSession, onAuthStateChange } from '@/src/lib/supabase/auth'
import { supabase } from '@/src/lib/supabase/client'

type SignalPayload = {
  type: 'MATCH_FOUND'
  matchId: string
  player1Id: string
  player2Id: string
}

const MATCHMAKING_CHANNEL = 'matchmaking'
const PAIR_INTERVAL_MS = 400

export default function FindMatchPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [profile, setProfile] = useState<{ username: string; elo_rating: number } | null>(null)
  const [searching, setSearching] = useState(false)
  const [onlinePlayers, setOnlinePlayers] = useState<PresencePlayer[]>([])
  const [channelReady, setChannelReady] = useState(false)
  const [connStatus, setConnStatus] = useState<string>('idle')
  const [connDetail, setConnDetail] = useState<string | null>(null)
  const [queueError, setQueueError] = useState<string | null>(null)

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const pairIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pairingRef = useRef(false)
  const sessionRef = useRef<Session | null>(null)
  const profileRef = useRef<{ username: string; elo_rating: number } | null>(null)

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
      if (!s) router.replace('/login')
    })
    const {
      data: { subscription },
    } = onAuthStateChange((_e, s) => {
      setSession(s)
      if (!s) router.replace('/login')
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

  const refreshPresenceList = useCallback(() => {
    const ch = channelRef.current
    if (!ch) return
    const raw = ch.presenceState() as Record<string, unknown[] | undefined>
    setOnlinePlayers(parsePresencePlayers(raw))
  }, [])

  const cleanupChannel = useCallback(() => {
    if (pairIntervalRef.current) {
      clearInterval(pairIntervalRef.current)
      pairIntervalRef.current = null
    }
    const ch = channelRef.current
    channelRef.current = null
    setChannelReady(false)
    if (ch) void supabase.removeChannel(ch)
    pairingRef.current = false
    setOnlinePlayers([])
    setConnStatus('idle')
  }, [])

  const trackPresence = useCallback(
    async (searchingFlag: boolean) => {
      const ch = channelRef.current
      const uid = sessionRef.current?.user.id
      if (!ch || !uid) return
      const pr = profileRef.current
      try {
        await ch.track({
          userId: uid,
          username: pr?.username ?? uid.slice(0, 8),
          elo: pr?.elo_rating ?? 1200,
          searching: searchingFlag,
          updatedAt: new Date().toISOString(),
        })
      } catch (e) {
        setConnDetail(e instanceof Error ? e.message : 'track failed')
      }
      refreshPresenceList()
    },
    [refreshPresenceList],
  )

  useEffect(() => {
    if (!ready || !session?.user.id) return

    const uid = session.user.id

    const ch = supabase.channel(MATCHMAKING_CHANNEL, {
      config: {
        presence: { key: uid },
        broadcast: { self: true },
      },
    })
    channelRef.current = ch

    const tryPair = async () => {
      const s = sessionRef.current
      const chInner = channelRef.current
      if (!s?.user?.id || !chInner || pairingRef.current) return

      const players = parsePresencePlayers(
        chInner.presenceState() as Record<string, unknown[] | undefined>,
      )
      const ids = searchingUserIds(players)
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

      const res = await fetch('/api/match/create', {
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

      await chInner.send({
        type: 'broadcast',
        event: 'signal',
        payload: found as unknown as Record<string, unknown>,
      })

      cleanupChannel()
      setSearching(false)
      router.push(`/match/${json.matchId}`)
    }

    ch.on('presence', { event: 'sync' }, () => {
      refreshPresenceList()
    })
    ch.on('presence', { event: 'join' }, () => {
      refreshPresenceList()
    })
    ch.on('presence', { event: 'leave' }, () => {
      refreshPresenceList()
    })

    ch.on(
      'broadcast',
      { event: 'signal' },
      ({ payload }: { payload: SignalPayload | Record<string, unknown> }) => {
        const p = payload as SignalPayload
        if (p?.type === 'MATCH_FOUND') {
          if (p.player1Id === uid || p.player2Id === uid) {
            cleanupChannel()
            setSearching(false)
            router.push(`/match/${p.matchId}`)
          }
        }
      },
    )

    void ch.subscribe(async (status, err) => {
      if (status === 'SUBSCRIBED') {
        setConnStatus('connected')
        setConnDetail(null)

        const pr = profileRef.current
        try {
          await ch.track({
            userId: uid,
            username: pr?.username ?? uid.slice(0, 8),
            elo: pr?.elo_rating ?? 1200,
            searching: false,
            updatedAt: new Date().toISOString(),
          })
        } catch (e) {
          setConnDetail(e instanceof Error ? e.message : 'initial track failed')
        }
        refreshPresenceList()
        setChannelReady(true)

        pairIntervalRef.current = setInterval(() => {
          void tryPair()
        }, PAIR_INTERVAL_MS)
      } else if (status === 'CHANNEL_ERROR') {
        setConnStatus('error')
        setConnDetail(err?.message ?? 'channel error')
        setChannelReady(false)
      } else {
        setConnStatus(String(status).toLowerCase())
      }
    })

    return () => {
      cleanupChannel()
    }
  }, [cleanupChannel, ready, refreshPresenceList, router, session?.user.id])

  useEffect(() => {
    if (!channelReady) return
    const id = window.setTimeout(() => {
      void trackPresence(searching)
    }, 0)
    return () => window.clearTimeout(id)
  }, [channelReady, searching, profile, trackPresence])

  const handleToggleSearch = useCallback(() => {
    setQueueError(null)
    setSearching((v) => !v)
  }, [])

  if (!ready || !session) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">Loading…</p>
      </div>
    )
  }

  const myId = session.user.id
  const searchers = onlinePlayers.filter((p) => p.searching)

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col gap-6 bg-zinc-50 px-4 py-10 dark:bg-black">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Find a match</h1>
        <Link
          href="/lobby"
          className="text-sm font-medium text-emerald-700 underline dark:text-emerald-400"
        >
          ← Lobby
        </Link>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-amber-50/90 px-4 py-3 text-sm dark:border-amber-900/40 dark:bg-amber-950/30">
        <p className="font-medium text-amber-950 dark:text-amber-100">Realtime (debug)</p>
        <p className="mt-1 text-amber-900/90 dark:text-amber-200/90">
          Status: <span className="font-mono">{connStatus}</span>
          {connDetail ? ` — ${connDetail}` : null}
        </p>
        <p className="mt-1 text-amber-900/80 dark:text-amber-200/80">
          Channel: <span className="font-mono">{MATCHMAKING_CHANNEL}</span> · You:{' '}
          <span className="font-mono text-xs">{myId}</span>
        </p>
        <p className="mt-1 text-amber-900/80 dark:text-amber-200/80">
          Searchers (presence): <strong>{searchers.length}</strong> · Online:{' '}
          <strong>{onlinePlayers.length}</strong>
        </p>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Players on this page</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Presence syncs who has this page open. Both players must click &quot;Find match&quot; to queue.
        </p>
        <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto text-sm">
          {onlinePlayers.length === 0 ? (
            <li className="text-zinc-500 dark:text-zinc-400">
              {connStatus === 'connected'
                ? 'Connected — waiting for presence sync…'
                : 'Connecting to Realtime…'}
            </li>
          ) : (
            onlinePlayers.map((p) => (
              <li
                key={p.userId}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                  p.userId === myId
                    ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
                    : 'border-zinc-100 dark:border-zinc-800'
                }`}
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {p.username}
                  {p.userId === myId ? ' (you)' : ''}
                </span>
                <span className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  Elo {p.elo}
                  {p.searching ? (
                    <span className="rounded bg-amber-200 px-1.5 py-0.5 text-amber-950 dark:bg-amber-800 dark:text-amber-100">
                      searching
                    </span>
                  ) : (
                    <span className="text-zinc-400">idle</span>
                  )}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <div className="flex flex-col gap-3">
        {!searching ? (
          <button
            type="button"
            onClick={handleToggleSearch}
            disabled={!channelReady}
            className="flex h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600"
          >
            {channelReady ? 'Find match' : 'Connecting…'}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-6 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent dark:border-emerald-400"
              aria-hidden
            />
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              Searching for an opponent…
            </p>
            <button
              type="button"
              onClick={handleToggleSearch}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {queueError ? (
        <p className="text-center text-sm text-red-600 dark:text-red-400" role="alert">
          {queueError}
        </p>
      ) : null}
    </div>
  )
}
