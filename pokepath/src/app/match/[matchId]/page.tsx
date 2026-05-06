'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'

import { GameBoard } from '@/src/components/board/GameBoard'
import { PokemonSpeciesPickerModal } from '@/src/components/pick/PokemonSpeciesPickerModal'
import { MobileActionTray } from '@/src/components/ui/MobileActionTray'
import { PortraitOnlyGameShell } from '@/src/components/ui/PortraitOnlyGameShell'
import { Scoreboard } from '@/src/components/ui/Scoreboard'
import { VictoryModal } from '@/src/components/ui/VictoryModal'
import { useToast } from '@/src/components/ui/toast'
import { applyCommittedTurn } from '@/src/lib/engine/applyCommittedTurn'
import { hydrateOnlineMatchFromRow } from '@/src/lib/match/hydrateOnlineMatch'
import { mergeBoardPokemonAfterCommit } from '@/src/lib/match/mergeBoardPokemonAfterCommit'
import {
  resolveMatchEntryBoardPokemonPicker,
  speciesInPokemonTeam,
} from '@/src/lib/match/resolveMatchEntryBoardPokemonPicker'
import { normalizedTurnSnapshotJsonIgnoringBoardPokemon } from '@/src/lib/match/snapshotUtils'
import { matchLeaveMessage } from '@/src/lib/navigation/leavePageMessages'
import {
  BOARD_POKEMON_PICK_MATCH_STORAGE_KEY,
  parseBoardPokemonPickJson,
  serializeBoardPokemonPick,
} from '@/src/lib/pokemon/boardPokemonPickStorage'
import { POKEMON_TEAM_PICK_STORAGE_KEY, parsePokemonTeamPickJson } from '@/src/lib/pokemon/pokemonTeamPickStorage'
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
/** Avoid duplicate end-game toast in React Strict Mode (dev). */
const reportedMatchToast = new Set<string>()

const OPPONENT_OFFLINE_MS = 2800

type TurnPayload = {
  fromUserId: string
  stateVersion: number
  action: PendingAction
  newState: Pick<GameState, 'turn' | 'players' | 'fences' | 'winner' | 'status' | 'pendingAction' | 'arena'>
}

type BoardPokemonPayload = {
  fromUserId: string
  speciesId: string
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
  const [pokemonPickerOpen, setPokemonPickerOpen] = useState(false)
  const [pokemonPickerOptions, setPokemonPickerOptions] = useState<[StarterSpecies, StarterSpecies] | null>(
    null,
  )

  const matchStartedAt = useRef<number | null>(null)
  const plyCount = useRef(0)
  const stateVersionRef = useRef(0)
  const displayRef = useRef<InitMatchDisplay>({})
  const playersRef = useRef<{ p1: string; p2: string } | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const channelSubscribedRef = useRef(false)
  const pendingBoardPokemonSpeciesRef = useRef<string | null>(null)
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

      const created = row.created_at ? Date.parse(String(row.created_at)) : NaN
      matchStartedAt.current = Number.isFinite(created) ? created : Date.now()

      const applyVersionAfterHydrate = (gameState: unknown | null, sv: number) => {
        const ok = hydrateOnlineMatchFromRow({
          matchId,
          player1Id: p1,
          player2Id: p2,
          gameState: gameState ?? null,
          display,
        })
        if (ok && Number.isFinite(sv)) {
          stateVersionRef.current = sv
          plyCount.current = sv
        }
        return ok
      }

      let hydrated = applyVersionAfterHydrate(row.game_state ?? null, Number(row.state_version ?? 0))
      if (!hydrated) {
        const { data: row2 } = await supabase
          .from('matches')
          .select('game_state, state_version')
          .eq('id', matchId)
          .maybeSingle()
        if (!cancelled && row2) {
          hydrated = applyVersionAfterHydrate(row2.game_state ?? null, Number(row2.state_version ?? 0))
        }
      }
      if (!hydrated && !cancelled) {
        console.warn('[match] hydrate failed after load + refetch; match board may be out of sync')
        setLoadError('Could not load match board state')
        setLoading(false)
        return
      }

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

  const sendBoardPokemonBroadcast = useCallback(
    (speciesId: string) => {
      if (!starterSpeciesById(speciesId) || !sessionUserId) return
      const ch = channelRef.current
      if (!ch || !channelSubscribedRef.current) {
        pendingBoardPokemonSpeciesRef.current = speciesId
        return
      }
      const payload: BoardPokemonPayload = { fromUserId: sessionUserId, speciesId }
      void ch.send({
        type: 'broadcast',
        event: 'board_pokemon',
        payload: payload as unknown as Record<string, unknown>,
      })
    },
    [sessionUserId],
  )

  const persistBoardPokemonPick = useCallback(
    async (speciesId: string) => {
      if (!matchId || !starterSpeciesById(speciesId)) return
      const {
        data: { session },
      } = await getSession()
      const token = session?.access_token
      if (!token) return
      const res = await fetch('/api/match/board-pokemon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matchId, speciesId }),
      })
      if (!res.ok) {
        console.warn('[match] persist board pokemon failed', res.status)
      }
    },
    [matchId],
  )

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
          const syncVersion = (gameState: unknown | null, sv: number) => {
            const ok = hydrateOnlineMatchFromRow({
              matchId,
              player1Id: pr.p1,
              player2Id: pr.p2,
              gameState: gameState ?? null,
              display: displayRef.current,
            })
            if (ok) {
              stateVersionRef.current = sv
              plyCount.current = sv
            }
            return ok
          }
          let ok = syncVersion(j.gameState ?? null, j.stateVersion)
          if (!ok) {
            const { data: fresh } = await supabase
              .from('matches')
              .select('game_state, state_version')
              .eq('id', matchId)
              .maybeSingle()
            if (fresh && typeof fresh.state_version === 'number') {
              ok = syncVersion(fresh.game_state ?? null, fresh.state_version as number)
            }
          }
          if (!ok) {
            console.warn('[match] 409 reconcile hydrate failed')
          }
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
    channelSubscribedRef.current = false

    const applyPostgresRowHydrate = (gameState: unknown | null, version: number): boolean => {
      const ok = hydrateOnlineMatchFromRow({
        matchId,
        player1Id: pr.p1,
        player2Id: pr.p2,
        gameState: gameState ?? null,
        display: displayRef.current,
      })
      if (ok && Number.isFinite(version)) {
        stateVersionRef.current = version
        plyCount.current = version
      }
      return ok
    }

    const onBroadcastBoardPokemon = ({ payload }: { payload: Record<string, unknown> }) => {
      const p = payload as unknown as BoardPokemonPayload
      if (!p?.fromUserId || typeof p.speciesId !== 'string') return
      if (p.fromUserId === sessionUserId) return
      if (p.fromUserId !== opponentId) {
        console.warn('[match] board_pokemon from unexpected user', p.fromUserId)
        return
      }
      if (!starterSpeciesById(p.speciesId)) return
      const state = useGameStore.getState()
      const seat = playerKeyForUserId(state, p.fromUserId)
      if (seat === null) return
      useGameStore.getState().setPokemonSpecies(seat, p.speciesId)
    }

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

      const merged = mergeBoardPokemonAfterCommit(applied.next, p.newState, state, senderKey)
      const expected = normalizedTurnSnapshotJsonIgnoringBoardPokemon(merged)
      const received = normalizedTurnSnapshotJsonIgnoringBoardPokemon(p.newState)
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

    room.on('broadcast', { event: 'board_pokemon' }, onBroadcastBoardPokemon)
    room.on('broadcast', { event: 'turn' }, onBroadcastTurn)

    room.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` }, (payload) => {
      const row = payload.new as Record<string, unknown>
      const v = Number(row.state_version ?? 0)
      if (!Number.isFinite(v) || v < stateVersionRef.current) return

      if (v === stateVersionRef.current) {
        const ok = hydrateOnlineMatchFromRow({
          matchId,
          player1Id: pr.p1,
          player2Id: pr.p2,
          gameState: row.game_state ?? null,
          display: displayRef.current,
        })
        if (!ok) {
          void (async () => {
            const { data: fresh } = await supabase
              .from('matches')
              .select('game_state, state_version')
              .eq('id', matchId)
              .maybeSingle()
            if (!fresh) return
            const fv = Number(fresh.state_version ?? 0)
            if (fv !== v) return
            if (
              !hydrateOnlineMatchFromRow({
                matchId,
                player1Id: pr.p1,
                player2Id: pr.p2,
                gameState: fresh.game_state ?? null,
                display: displayRef.current,
              })
            ) {
              console.warn('[match] same-version postgres hydrate failed after refetch')
            }
          })()
        }
        return
      }

      if (applyPostgresRowHydrate(row.game_state ?? null, v)) return

      void (async () => {
        const { data: fresh } = await supabase
          .from('matches')
          .select('game_state, state_version')
          .eq('id', matchId)
          .maybeSingle()
        if (!fresh) return
        const fv = Number(fresh.state_version ?? 0)
        if (!Number.isFinite(fv) || fv < v) return
        if (!applyPostgresRowHydrate(fresh.game_state ?? null, fv)) {
          console.warn('[match] postgres_changes hydrate failed after refetch')
        }
      })()
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
        channelSubscribedRef.current = true
        await room.track({ online_at: Date.now() })
        refreshOpponentPresence(room, opponentId)

        const { data: liveRow } = await supabase
          .from('matches')
          .select('game_state, state_version')
          .eq('id', matchId)
          .maybeSingle()
        if (liveRow) {
          const sv = Number(liveRow.state_version ?? 0)
          if (Number.isFinite(sv) && sv > stateVersionRef.current) {
            if (!applyPostgresRowHydrate(liveRow.game_state ?? null, sv)) {
              const { data: fresh } = await supabase
                .from('matches')
                .select('game_state, state_version')
                .eq('id', matchId)
                .maybeSingle()
              if (fresh) {
                const fv = Number(fresh.state_version ?? 0)
                if (Number.isFinite(fv) && fv >= sv) {
                  void applyPostgresRowHydrate(fresh.game_state ?? null, fv)
                }
              }
            }
          }
        }

        const sendBoardPokemon = (speciesId: string) => {
          const payload: BoardPokemonPayload = { fromUserId: sessionUserId, speciesId }
          void room.send({
            type: 'broadcast',
            event: 'board_pokemon',
            payload: payload as unknown as Record<string, unknown>,
          })
        }

        const pending = pendingBoardPokemonSpeciesRef.current
        if (pending && starterSpeciesById(pending)) {
          pendingBoardPokemonSpeciesRef.current = null
          sendBoardPokemon(pending)
        } else {
          const seat: PlayerKey = sessionUserId === pr.p1 ? 'player1' : 'player2'
          const species = useGameStore.getState().players[seat].pawnSpeciesId
          if (species && starterSpeciesById(species)) {
            sendBoardPokemon(species)
          }
        }
      }
    })

    return () => {
      if (opponentOfflineTimerRef.current) {
        clearTimeout(opponentOfflineTimerRef.current)
        opponentOfflineTimerRef.current = null
      }
      channelSubscribedRef.current = false
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
    if (!winner || !matchId || !localPlayerKey || !sessionUserId) return
    const toastKey = `${matchId}:${sessionUserId}`
    if (reportedMatchToast.has(toastKey)) return
    reportedMatchToast.add(toastKey)

    const message = winner === localPlayerKey ? 'You win! Match complete.' : 'You lost. Match complete.'
    showToast({
      message,
      variant: winner === localPlayerKey ? 'success' : 'default',
      primaryAction: {
        label: 'Home',
        onClick: () => router.push('/lobby'),
      },
      secondaryAction: {
        label: 'Play Again',
        onClick: () => router.push('/lobby'),
      },
    })
  }, [localPlayerKey, matchId, router, sessionUserId, showToast, winner])

  useEffect(() => {
    if (loading || !localPlayerKey || !sessionUserId || !matchId) return

    queueMicrotask(() => {
      try {
        const trainerStorageKey = `${sessionUserId}:${matchId}`
        const rawBoardPick = sessionStorage.getItem(BOARD_POKEMON_PICK_MATCH_STORAGE_KEY)
        const boardPickStored = parseBoardPokemonPickJson(rawBoardPick)

        const rawPokemonTeam = sessionStorage.getItem(POKEMON_TEAM_PICK_STORAGE_KEY)
        const parsedPokemonTeam = parsePokemonTeamPickJson(rawPokemonTeam)
        const [idA, idB] = parsedPokemonTeam?.speciesIds ?? [null, null]
        const sa = idA ? starterSpeciesById(idA) : undefined
        const sb = idB ? starterSpeciesById(idB) : undefined

        const seatBoardPokemonSpeciesId =
          useGameStore.getState().players[localPlayerKey].pawnSpeciesId

        if (
          boardPickStored?.trainerKey === trainerStorageKey &&
          boardPickStored.speciesId &&
          parsedPokemonTeam &&
          !speciesInPokemonTeam(boardPickStored.speciesId, parsedPokemonTeam)
        ) {
          try {
            sessionStorage.removeItem(BOARD_POKEMON_PICK_MATCH_STORAGE_KEY)
          } catch {
            // ignore quota / private mode
          }
        }

        const decision = resolveMatchEntryBoardPokemonPicker({
          trainerStorageKey,
          boardPickStored,
          parsedPokemonTeam,
          optionA: sa,
          optionB: sb,
          seatBoardPokemonSpeciesId,
        })

        if (decision.kind === 'applyStored') {
          useGameStore.getState().setPokemonSpecies(localPlayerKey, decision.speciesId)
          sendBoardPokemonBroadcast(decision.speciesId)
          void persistBoardPokemonPick(decision.speciesId)
          setPokemonPickerOpen(false)
          setPokemonPickerOptions(null)
          return
        }
        if (decision.kind === 'trustSeat') {
          setPokemonPickerOpen(false)
          setPokemonPickerOptions(null)
          return
        }
        if (decision.kind === 'openPicker') {
          if (decision.clearSeat) {
            useGameStore.getState().setPokemonSpecies(localPlayerKey, null)
          }
          setPokemonPickerOptions(decision.options)
          setPokemonPickerOpen(true)
          return
        }
        setPokemonPickerOpen(false)
        setPokemonPickerOptions(null)
        router.replace(`/pick?continue=${encodeURIComponent(`/match/${matchId}`)}`)
      } catch {
        setPokemonPickerOpen(false)
        setPokemonPickerOptions(null)
      }
    })
  }, [loading, localPlayerKey, matchId, persistBoardPokemonPick, router, sendBoardPokemonBroadcast, sessionUserId])

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

  const goToLobby = useCallback(() => {
    router.push('/lobby')
  }, [router])

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
          primaryLabel="Home"
          onPrimary={goToLobby}
          secondaryLabel="Play Again"
          onSecondary={goToLobby}
        />

        {pokemonPickerOpen && pokemonPickerOptions && (
          <PokemonSpeciesPickerModal
            open
            options={pokemonPickerOptions}
            onConfirm={(speciesId) => {
              if (!localPlayerKey || !sessionUserId) return
              const trainerStorageKey = `${sessionUserId}:${matchId}`
              try {
                sessionStorage.setItem(
                  BOARD_POKEMON_PICK_MATCH_STORAGE_KEY,
                  serializeBoardPokemonPick({ trainerKey: trainerStorageKey, speciesId }),
                )
              } catch {
                // ignore quota / private mode
              }
              useGameStore.getState().setPokemonSpecies(localPlayerKey, speciesId)
              sendBoardPokemonBroadcast(speciesId)
              void persistBoardPokemonPick(speciesId)
              setPokemonPickerOpen(false)
            }}
          />
        )}
      </div>
    </PortraitOnlyGameShell>
  )
}
