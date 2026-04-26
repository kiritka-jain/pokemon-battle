'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'

import { GameBoard } from '@/src/components/board/GameBoard'
import { PawnSpeciesPickerModal } from '@/src/components/pick/PawnSpeciesPickerModal'
import { MobileActionTray } from '@/src/components/ui/MobileActionTray'
import { PortraitOnlyGameShell } from '@/src/components/ui/PortraitOnlyGameShell'
import { Scoreboard } from '@/src/components/ui/Scoreboard'
import { VictoryModal } from '@/src/components/ui/VictoryModal'
import { useToast } from '@/src/components/ui/toast'
import { applyCommittedTurn } from '@/src/lib/engine/applyCommittedTurn'
import { hydrateOnlineMatchFromRow } from '@/src/lib/match/hydrateOnlineMatch'
import { mergePawnsAfterCommit } from '@/src/lib/match/mergePawnsAfterCommit'
import {
  resolveMatchEntryPawnPicker,
  speciesInPartnerList,
} from '@/src/lib/match/resolveMatchEntryPawnPicker'
import { normalizedTurnSnapshotJson } from '@/src/lib/match/snapshotUtils'
import { matchLeaveMessage } from '@/src/lib/navigation/leavePageMessages'
import {
  PAWN_PICK_MATCH_STORAGE_KEY,
  parsePawnPickJson,
  serializePawnPick,
} from '@/src/lib/pokemon/pawnPickStorage'
import {
  PARTNER_PICK_STORAGE_KEY,
  parsePartnerPickJson,
} from '@/src/lib/pokemon/partnerPickStorage'
import type { StarterSpecies } from '@/src/lib/pokemon/starterRoster'
import { starterSpeciesById } from '@/src/lib/pokemon/starterRoster'
import {
  playerKeyForUserId,
  validateIncomingTurn,
} from '@/src/lib/match/validateIncomingTurn'
import { getSession, onAuthStateChange } from '@/src/lib/supabase/auth'
import { supabase } from '@/src/lib/supabase/client'
import { useGameStore, type InitMatchDisplay } from '@/src/lib/store/gameStore'
import type { GameState, PendingAction, PlayerKey } from '@/src/types/game'

/** Avoid duplicate POST /api/match/end in React Strict Mode (dev). */
const reportedMatchEnd = new Set<string>()

const OPPONENT_OFFLINE_MS = 2800

type TurnPayload = {
  fromUserId: string
  stateVersion: number
  action: PendingAction
  newState: Pick<GameState, 'turn' | 'players' | 'fences' | 'winner' | 'status' | 'pendingAction' | 'arena'>
}

export default function MatchPage() {
  const params = useParams()
  const router = useRouter()
  const { show: showToast } = useToast()
  const matchId = typeof params.matchId === 'string' ? params.matchId : ''

  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [localPlayerKey, setLocalPlayerKey] = useState<PlayerKey | null>(null)
  const [opponentId, setOpponentId] = useState<string | null>(null)
  const [opponentDisconnected, setOpponentDisconnected] = useState(false)
  const [resigning, setResigning] = useState(false)
  const [pawnPickerOpen, setPawnPickerOpen] = useState(false)
  const [pawnPickerOptions, setPawnPickerOptions] = useState<[StarterSpecies, StarterSpecies] | null>(
    null,
  )

  const matchStartedAt = useRef<number | null>(null)
  const plyCount = useRef(0)
  const stateVersionRef = useRef(0)
  const displayRef = useRef<InitMatchDisplay>({})
  const playersRef = useRef<{ p1: string; p2: string } | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const opponentOfflineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const winner = useGameStore((s) => s.winner)
  const gameStatus = useGameStore((s) => s.status)

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
        .select('player1_id, player2_id, status, game_state, state_version, created_at')
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
      playersRef.current = { p1, p2 }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, elo_rating')
        .in('id', [p1, p2])

      if (cancelled) return

      const byId = Object.fromEntries((profiles ?? []).map((pr) => [pr.id, pr]))
      const d1 = byId[p1]
      const d2 = byId[p2]
      const display: InitMatchDisplay = {
        player1Username: d1?.username,
        player2Username: d2?.username,
        player1Elo: d1?.elo_rating,
        player2Elo: d2?.elo_rating,
      }
      displayRef.current = display

      const sv = Number(row.state_version ?? 0)
      stateVersionRef.current = sv
      plyCount.current = sv

      const created = row.created_at ? Date.parse(String(row.created_at)) : NaN
      matchStartedAt.current = Number.isFinite(created) ? created : Date.now()

      hydrateOnlineMatchFromRow({
        matchId,
        player1Id: p1,
        player2Id: p2,
        gameState: row.game_state ?? null,
        display,
      })

      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [matchId, sessionUserId])

  const broadcastTurn = useCallback((payload: TurnPayload) => {
    const ch = channelRef.current
    if (!ch) return
    void ch.send({
      type: 'broadcast',
      event: 'turn',
      payload: payload as unknown as Record<string, unknown>,
    })
  }, [])

  const afterSuccessfulCommit = useCallback(
    async (ctx: {
      preCommitSnapshot: Pick<
        GameState,
        'turn' | 'players' | 'fences' | 'winner' | 'status' | 'pendingAction' | 'arena'
      >
      committedAction: PendingAction
      previousTurn: PlayerKey
      snapshot: Pick<GameState, 'turn' | 'players' | 'fences' | 'winner' | 'status' | 'pendingAction' | 'arena'>
    }) => {
      if (!sessionUserId || !localPlayerKey || !matchId) return
      const moverId = ctx.snapshot.players[ctx.previousTurn].id
      if (sessionUserId !== moverId) return

      const {
        data: { session },
      } = await getSession()
      const token = session?.access_token
      if (!token) {
        throw new Error('Not authenticated')
      }

      const baseVersion = stateVersionRef.current
      const res = await fetch('/api/match/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId,
          baseVersion,
          committedAction: ctx.committedAction,
          newState: ctx.snapshot,
        }),
      })

      if (res.status === 409) {
        const j = (await res.json()) as {
          stateVersion?: number
          gameState?: unknown
        }
        const pr = playersRef.current
        if (pr && typeof j.stateVersion === 'number') {
          stateVersionRef.current = j.stateVersion
          plyCount.current = j.stateVersion
          hydrateOnlineMatchFromRow({
            matchId,
            player1Id: pr.p1,
            player2Id: pr.p2,
            gameState: j.gameState ?? null,
            display: displayRef.current,
          })
        }
        showToast({ message: 'Synced with the latest match state.', variant: 'default' })
        return
      }

      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || 'Save failed')
      }

      const json = (await res.json()) as { stateVersion?: number }
      if (typeof json.stateVersion !== 'number' || !Number.isInteger(json.stateVersion)) {
        throw new Error('Missing state version in save response')
      }

      stateVersionRef.current = json.stateVersion
      plyCount.current = json.stateVersion

      broadcastTurn({
        fromUserId: sessionUserId,
        stateVersion: json.stateVersion,
        action: ctx.committedAction,
        newState: ctx.snapshot,
      })
    },
    [broadcastTurn, localPlayerKey, matchId, sessionUserId, showToast],
  )

  const refreshOpponentPresence = useCallback(
    (room: ReturnType<typeof supabase.channel>, oid: string) => {
      const st = room.presenceState() as Record<string, unknown[] | undefined>
      const online = Boolean(st[oid]?.length)
      if (opponentOfflineTimerRef.current) {
        clearTimeout(opponentOfflineTimerRef.current)
        opponentOfflineTimerRef.current = null
      }
      if (online) {
        setOpponentDisconnected(false)
        return
      }
      opponentOfflineTimerRef.current = setTimeout(() => {
        setOpponentDisconnected(true)
        opponentOfflineTimerRef.current = null
      }, OPPONENT_OFFLINE_MS)
    },
    [],
  )

  useEffect(() => {
    if (!matchId || !sessionUserId || !opponentId || loading) return

    const pr = playersRef.current
    if (!pr) return

    const room = supabase.channel(`room_${matchId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: sessionUserId },
      },
    })
    channelRef.current = room

    const onBroadcastTurn = ({ payload }: { payload: Record<string, unknown> }) => {
      const p = payload as unknown as TurnPayload
      if (!p?.fromUserId || p.fromUserId === sessionUserId) return
      if (p.fromUserId !== opponentId) {
        console.warn('[match] TURN from unexpected user', p.fromUserId)
        return
      }

      const state = useGameStore.getState() as GameState
      const senderKey = playerKeyForUserId(state, p.fromUserId)
      if (senderKey === null || senderKey !== state.turn) {
        console.warn('[match] TURN sender does not match current turn seat', p.fromUserId)
        return
      }
      if (!validateIncomingTurn(state, p.action, senderKey)) {
        console.warn('[match] Rejected invalid opponent turn', p)
        return
      }

      const applied = applyCommittedTurn(state, senderKey, p.action)
      if (!applied.ok) {
        console.warn('[match] Rejected unresolvable opponent turn', applied.reason, p)
        return
      }

      const merged = mergePawnsAfterCommit(applied.next, p.newState, state, senderKey)
      const expected = normalizedTurnSnapshotJson(merged)
      const received = normalizedTurnSnapshotJson(p.newState)
      if (expected !== received) {
        console.warn('[match] Rejected mismatched opponent state payload', p)
        return
      }

      if (!Number.isInteger(p.stateVersion) || p.stateVersion < 0) {
        console.warn('[match] TURN missing valid stateVersion', p)
        return
      }
      stateVersionRef.current = Math.max(stateVersionRef.current, p.stateVersion)
      plyCount.current = stateVersionRef.current

      useGameStore.getState().applyOpponentAction({
        turn: merged.turn,
        players: merged.players,
        fences: merged.fences,
        winner: merged.winner,
        status: merged.status,
        pendingAction: merged.pendingAction,
        arena: merged.arena,
      })
    }

    room.on('broadcast', { event: 'turn' }, onBroadcastTurn)

    room.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` }, (payload) => {
      const row = payload.new as Record<string, unknown>
      const v = Number(row.state_version ?? 0)
      if (!Number.isFinite(v) || v <= stateVersionRef.current) return

      stateVersionRef.current = v
      plyCount.current = v
      hydrateOnlineMatchFromRow({
        matchId,
        player1Id: pr.p1,
        player2Id: pr.p2,
        gameState: row.game_state ?? null,
        display: displayRef.current,
      })
    })

    room.on('presence', { event: 'sync' }, () => {
      refreshOpponentPresence(room, opponentId)
    })
    room.on('presence', { event: 'join' }, () => {
      refreshOpponentPresence(room, opponentId)
    })
    room.on('presence', { event: 'leave' }, () => {
      refreshOpponentPresence(room, opponentId)
    })

    void room.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await room.track({ online_at: Date.now() })
        refreshOpponentPresence(room, opponentId)
      }
    })

    return () => {
      if (opponentOfflineTimerRef.current) {
        clearTimeout(opponentOfflineTimerRef.current)
        opponentOfflineTimerRef.current = null
      }
      channelRef.current = null
      void supabase.removeChannel(room)
    }
  }, [loading, matchId, opponentId, refreshOpponentPresence, sessionUserId])

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

  const resignMatch = useCallback(async () => {
    if (!sessionUserId || !matchId || !localPlayerKey) return
    const s = useGameStore.getState()
    if (s.status !== 'active' || s.winner) return

    const opponentKey: PlayerKey = localPlayerKey === 'player1' ? 'player2' : 'player1'
    const winnerId = s.players[opponentKey].id
    const loserId = s.players[localPlayerKey].id
    if (!winnerId || !loserId || winnerId === loserId) return

    const confirmed = window.confirm('Resign this match? This will end the game and count as a loss.')
    if (!confirmed) return

    setResigning(true)
    try {
      const {
        data: { session },
      } = await getSession()
      const token = session?.access_token
      if (!token) {
        throw new Error('Not authenticated')
      }

      const started = matchStartedAt.current ?? Date.now()
      const durationSeconds = Math.max(0, Math.floor((Date.now() - started) / 1000))

      const finalBoardState = {
        turn: s.turn,
        players: s.players,
        fences: s.fences,
        winner: opponentKey,
        status: 'finished' as const,
      }

      const res = await fetch('/api/match/end', {
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
          finalBoardState,
        }),
      })

      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || 'Could not resign')
      }

      showToast({ message: 'You resigned the match.', variant: 'default' })
      router.push('/lobby')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not resign'
      showToast({ message, variant: 'error' })
    } finally {
      setResigning(false)
    }
  }, [localPlayerKey, matchId, router, sessionUserId, showToast])

  useEffect(() => {
    if (!winner || !matchId) return
    if (reportedMatchEnd.has(matchId)) return
    reportedMatchEnd.add(matchId)
    void postMatchEnd()
  }, [matchId, postMatchEnd, winner])

  useEffect(() => {
    if (loading || !localPlayerKey || !sessionUserId || !matchId) return

    queueMicrotask(() => {
      try {
        const trainerStorageKey = `${sessionUserId}:${matchId}`
        const rawPawn = sessionStorage.getItem(PAWN_PICK_MATCH_STORAGE_KEY)
        const pawnStored = parsePawnPickJson(rawPawn)

        const rawPartner = sessionStorage.getItem(PARTNER_PICK_STORAGE_KEY)
        const parsedPartner = parsePartnerPickJson(rawPartner)
        const [idA, idB] = parsedPartner?.speciesIds ?? [null, null]
        const sa = idA ? starterSpeciesById(idA) : undefined
        const sb = idB ? starterSpeciesById(idB) : undefined

        const seatPawn = useGameStore.getState().players[localPlayerKey].pawnSpeciesId

        if (
          pawnStored?.trainerKey === trainerStorageKey &&
          pawnStored.speciesId &&
          parsedPartner &&
          !speciesInPartnerList(pawnStored.speciesId, parsedPartner)
        ) {
          try {
            sessionStorage.removeItem(PAWN_PICK_MATCH_STORAGE_KEY)
          } catch {
            // ignore quota / private mode
          }
        }

        const decision = resolveMatchEntryPawnPicker({
          trainerStorageKey,
          pawnStored,
          parsedPartner,
          optionA: sa,
          optionB: sb,
          seatPawnSpeciesId: seatPawn,
        })

        if (decision.kind === 'applyStored') {
          useGameStore.getState().setPawnSpecies(localPlayerKey, decision.speciesId)
          setPawnPickerOpen(false)
          setPawnPickerOptions(null)
          return
        }
        if (decision.kind === 'trustSeat') {
          setPawnPickerOpen(false)
          setPawnPickerOptions(null)
          return
        }
        if (decision.kind === 'openPicker') {
          if (decision.clearSeat) {
            useGameStore.getState().setPawnSpecies(localPlayerKey, null)
          }
          setPawnPickerOptions(decision.options)
          setPawnPickerOpen(true)
          return
        }
        setPawnPickerOpen(false)
        setPawnPickerOptions(null)
      } catch {
        setPawnPickerOpen(false)
        setPawnPickerOptions(null)
      }
    })
  }, [loading, localPlayerKey, sessionUserId, matchId])

  useEffect(() => {
    if (!matchId || loading) return
    const warn = (e: BeforeUnloadEvent) => {
      const { status, winner: w } = useGameStore.getState()
      if (status === 'active' && !w) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [loading, matchId])

  const confirmLeave = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, href: string) => {
      const { status, winner: w } = useGameStore.getState()
      if (status === 'active' && !w) {
        e.preventDefault()
        if (window.confirm(matchLeaveMessage())) {
          router.push(href)
        }
      }
    },
    [router],
  )

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
    winner === localPlayerKey ? 'You win!' : winner ? 'You lost' : ''

  return (
    <PortraitOnlyGameShell>
      <div className="flex min-h-full flex-col items-center gap-2 px-4 pb-28 pt-3">
        <div className="sticky top-0 z-20 w-full max-w-[520px] rounded-lg border border-zinc-200/80 bg-zinc-50/90 px-2.5 py-1.5 text-xs shadow-sm backdrop-blur dark:border-zinc-700/80 dark:bg-zinc-900/90">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/lobby"
              onClick={(e) => confirmLeave(e, '/lobby')}
              className="font-medium text-emerald-800 underline dark:text-emerald-400"
            >
              ← Lobby
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/lobby/in-progress"
                onClick={(e) => confirmLeave(e, '/lobby/in-progress')}
                className="text-zinc-600 underline dark:text-zinc-400"
              >
                In-progress
              </Link>
              <Link
                href="/leaderboard"
                onClick={(e) => confirmLeave(e, '/leaderboard')}
                className="text-zinc-600 underline dark:text-zinc-400"
              >
                Leaderboard
              </Link>
              {gameStatus === 'active' && !winner ? (
                <button
                  type="button"
                  onClick={() => {
                    void resignMatch()
                  }}
                  disabled={resigning}
                  className="rounded-full border border-red-300 px-2.5 py-0.5 font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  {resigning ? 'Resigning...' : 'Resign'}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {opponentDisconnected && gameStatus === 'active' && !winner ? (
          <p
            className="max-w-[520px] rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-center text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
            role="status"
          >
            Opponent is offline. You can wait, or continue once they rejoin.
          </p>
        ) : null}

        <Scoreboard localPlayerKey={localPlayerKey} compact />

        <div className="w-full max-w-[520px] rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
          <GameBoard localPlayerKey={localPlayerKey} viewAsPlayer={localPlayerKey} compact />
        </div>

        <MobileActionTray actingUserId={sessionUserId} afterSuccessfulCommit={afterSuccessfulCommit} />

        <VictoryModal
          open={Boolean(winner)}
          title={winTitle}
          subtitle={winner ? `Match ${matchId.slice(0, 8)}…` : undefined}
          onPrimary={() => router.push('/lobby')}
        />

        {pawnPickerOpen && pawnPickerOptions && (
          <PawnSpeciesPickerModal
            open
            options={pawnPickerOptions}
            onConfirm={(speciesId) => {
              const trainerStorageKey = `${sessionUserId}:${matchId}`
              try {
                sessionStorage.setItem(
                  PAWN_PICK_MATCH_STORAGE_KEY,
                  serializePawnPick({ trainerKey: trainerStorageKey, speciesId }),
                )
              } catch {
                // ignore quota / private mode
              }
              useGameStore.getState().setPawnSpecies(localPlayerKey, speciesId)
              setPawnPickerOpen(false)
            }}
          />
        )}
      </div>
    </PortraitOnlyGameShell>
  )
}
