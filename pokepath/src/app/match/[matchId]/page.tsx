'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { GameBoard } from '@/src/components/board/GameBoard'
import { MobileActionTray } from '@/src/components/ui/MobileActionTray'
import { Scoreboard } from '@/src/components/ui/Scoreboard'
import { VictoryModal } from '@/src/components/ui/VictoryModal'
import { validateIncomingTurn } from '@/src/lib/match/validateIncomingTurn'
import { getSession, onAuthStateChange } from '@/src/lib/supabase/auth'
import { supabase } from '@/src/lib/supabase/client'
import {
  initialGameState,
  useGameStore,
  type InitMatchDisplay,
} from '@/src/lib/store/gameStore'
import type { GameState, PendingAction, PlayerKey } from '@/src/types/game'

/** Avoid duplicate POST /api/match/end in React Strict Mode (dev). */
const reportedMatchEnd = new Set<string>()

type TurnPayload = {
  fromUserId: string
  action: PendingAction
  newState: Pick<GameState, 'turn' | 'players' | 'fences' | 'winner' | 'status' | 'pendingAction'>
}

export default function MatchPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = typeof params.matchId === 'string' ? params.matchId : ''

  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [localPlayerKey, setLocalPlayerKey] = useState<PlayerKey | null>(null)
  const [opponentId, setOpponentId] = useState<string | null>(null)
  const matchStartedAt = useRef<number | null>(null)
  const plyCount = useRef(0)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const winner = useGameStore((s) => s.winner)

  useEffect(() => {
    let cancelled = false
    void getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (!session) {
        router.replace(`/login?redirect=/match/${matchId}`)
        return
      }
      setSessionUserId(session.user.id)
    })
    const {
      data: { subscription },
    } = onAuthStateChange((_e, session) => {
      if (!session) {
        router.replace(`/login?redirect=/match/${matchId}`)
      } else {
        setSessionUserId(session.user.id)
      }
    })
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [matchId, router])

  useEffect(() => {
    if (!matchId || !sessionUserId) return

    let cancelled = false

    void (async () => {
      const { data: row, error } = await supabase
        .from('matches')
        .select('player1_id, player2_id, status')
        .eq('id', matchId)
        .maybeSingle()

      if (cancelled) return

      if (error || !row?.player1_id || !row.player2_id) {
        setLoadError('Match not found')
        setLoading(false)
        return
      }

      if (row.status === 'finished') {
        setLoadError('This match has already ended')
        setLoading(false)
        return
      }

      const p1 = row.player1_id as string
      const p2 = row.player2_id as string
      if (p1 !== sessionUserId && p2 !== sessionUserId) {
        setLoadError('You are not a player in this match')
        setLoading(false)
        return
      }

      const meKey: PlayerKey = sessionUserId === p1 ? 'player1' : 'player2'
      setLocalPlayerKey(meKey)
      setOpponentId(meKey === 'player1' ? p2 : p1)

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, elo_rating')
        .in('id', [p1, p2])

      const byId = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))
      const d1 = byId[p1]
      const d2 = byId[p2]
      const display: InitMatchDisplay = {
        player1Username: d1?.username,
        player2Username: d2?.username,
        player1Elo: d1?.elo_rating,
        player2Elo: d2?.elo_rating,
      }

      useGameStore.setState(initialGameState)
      useGameStore.getState().initMatch(matchId, p1, p2, display)
      matchStartedAt.current = Date.now()
      plyCount.current = 0
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [matchId, sessionUserId])

  const broadcastTurn = useCallback(
    (payload: TurnPayload) => {
      const ch = channelRef.current
      if (!ch) return
      void ch.send({
        type: 'broadcast',
        event: 'turn',
        payload: payload as unknown as Record<string, unknown>,
      })
    },
    [],
  )

  const afterSuccessfulCommit = useCallback(
    (ctx: {
      committedAction: PendingAction
      snapshot: Pick<
        GameState,
        'turn' | 'players' | 'fences' | 'winner' | 'status' | 'pendingAction'
      >
    }) => {
      if (!sessionUserId || !localPlayerKey) return
      plyCount.current += 1
      broadcastTurn({
        fromUserId: sessionUserId,
        action: ctx.committedAction,
        newState: ctx.snapshot,
      })
    },
    [broadcastTurn, localPlayerKey, sessionUserId],
  )

  useEffect(() => {
    if (!matchId || !sessionUserId || !opponentId || loading) return

    const room = supabase.channel(`room_${matchId}`, {
      config: { broadcast: { self: true } },
    })
    channelRef.current = room

    room.on(
      'broadcast',
      { event: 'turn' },
      ({ payload }: { payload: Record<string, unknown> }) => {
        const p = payload as unknown as TurnPayload
        if (!p?.fromUserId || p.fromUserId === sessionUserId) return
        if (p.fromUserId !== opponentId) {
          console.warn('[match] TURN from unexpected user', p.fromUserId)
          return
        }

        const state = useGameStore.getState() as GameState
        const mover: PlayerKey = state.turn
        if (!validateIncomingTurn(state, p.action, mover)) {
          console.warn('[match] Rejected invalid opponent turn', p)
          return
        }

        plyCount.current += 1
        useGameStore.getState().applyOpponentAction({
          turn: p.newState.turn,
          players: p.newState.players,
          fences: p.newState.fences,
          winner: p.newState.winner,
          status: p.newState.status,
          pendingAction: p.newState.pendingAction,
        })
      },
    )

    void room.subscribe()

    return () => {
      channelRef.current = null
      void supabase.removeChannel(room)
    }
  }, [matchId, sessionUserId, opponentId, loading])

  const postMatchEnd = useCallback(async () => {
    if (!sessionUserId || !matchId || !localPlayerKey) return
    const s = useGameStore.getState()
    if (!s.winner || s.status !== 'finished') return

    const p1 = s.players.player1.id
    const p2 = s.players.player2.id
    const winnerId = s.winner === 'player1' ? p1 : p2
    const loserId = s.winner === 'player1' ? p2 : p1

    const {
      data: { session },
    } = await getSession()
    const token = session?.access_token
    if (!token) return

    const started = matchStartedAt.current ?? Date.now()
    const durationSeconds = Math.max(0, Math.floor((Date.now() - started) / 1000))

    await fetch('/api/match/end', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        matchId,
        winnerId,
        loserId,
        totalTurns: plyCount.current,
        durationSeconds,
        finalBoardState: {
          turn: s.turn,
          players: s.players,
          fences: s.fences,
          winner: s.winner,
          status: s.status,
        },
      }),
    })
  }, [localPlayerKey, matchId, sessionUserId])

  useEffect(() => {
    if (!winner || !matchId) return
    if (reportedMatchEnd.has(matchId)) return
    reportedMatchEnd.add(matchId)
    void postMatchEnd()
  }, [matchId, postMatchEnd, winner])

  if (loading || !sessionUserId) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">Loading match…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-4 dark:bg-black">
        <p className="text-center text-red-600 dark:text-red-400">{loadError}</p>
        <Link href="/lobby" className="text-sm font-medium text-emerald-700 underline dark:text-emerald-400">
          Back to lobby
        </Link>
      </div>
    )
  }

  if (!localPlayerKey) {
    return null
  }

  const winTitle =
    winner === localPlayerKey
      ? 'You win!'
      : winner
        ? 'You lost'
        : ''

  return (
    <div className="flex min-h-full flex-col items-center gap-4 px-4 pb-32 pt-8">
      <div className="flex w-full max-w-[520px] items-center justify-between gap-2 text-sm">
        <Link href="/lobby" className="font-medium text-emerald-800 underline dark:text-emerald-400">
          ← Lobby
        </Link>
        <Link href="/leaderboard" className="text-zinc-600 underline dark:text-zinc-400">
          Leaderboard
        </Link>
      </div>

      <Scoreboard />

      <GameBoard localPlayerKey={localPlayerKey} />

      <MobileActionTray afterSuccessfulCommit={afterSuccessfulCommit} />

      <VictoryModal
        open={Boolean(winner)}
        title={winTitle}
        subtitle={winner ? `Match ${matchId.slice(0, 8)}…` : undefined}
        onPrimary={() => router.push('/lobby')}
      />
    </div>
  )
}
