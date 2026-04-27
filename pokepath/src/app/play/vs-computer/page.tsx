'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { Session } from '@supabase/supabase-js'

import { GameBoard } from '@/src/components/board/GameBoard'
import { PokemonSpeciesPickerModal } from '@/src/components/pick/PokemonSpeciesPickerModal'
import { MobileActionTray } from '@/src/components/ui/MobileActionTray'
import { PortraitOnlyGameShell } from '@/src/components/ui/PortraitOnlyGameShell'
import { Scoreboard } from '@/src/components/ui/Scoreboard'
import {
  chooseAiPendingAction,
  type AiDifficulty,
} from '@/src/lib/ai/chooseAiPendingAction'
import { LOCAL_AI_OPPONENT_ID, LOCAL_AI_PRACTICE_MATCH_ID } from '@/src/lib/match/localAiPracticeMatchId'
import { pickTurnSnapshot, type TurnSnapshot } from '@/src/lib/match/snapshotUtils'
import { buildAiPracticeMatchDisplay } from '@/src/lib/play/localMatchDisplay'
import {
  BOARD_POKEMON_PICK_LOCAL_STORAGE_KEY,
  serializeBoardPokemonPick,
} from '@/src/lib/pokemon/boardPokemonPickStorage'
import {
  parsePokemonTeamPickJson,
  POKEMON_TEAM_PICK_STORAGE_KEY,
  pokemonTeamPickLabel,
} from '@/src/lib/pokemon/pokemonTeamPickStorage'
import { pickRandomStarterSpeciesId } from '@/src/lib/pokemon/pickRandomStarterSpeciesId'
import type { StarterSpecies } from '@/src/lib/pokemon/starterRoster'
import { starterSpeciesById } from '@/src/lib/pokemon/starterRoster'
import { useGameStore } from '@/src/lib/store/gameStore'
import { getSession, onAuthStateChange } from '@/src/lib/supabase/auth'
import { supabase } from '@/src/lib/supabase/client'
import type { GameState } from '@/src/types/game'

const SYNTH_HUMAN_ID = 'p1'

function buildGameStateSnapshot(): GameState {
  const s = useGameStore.getState()
  return {
    matchId: s.matchId,
    status: s.status,
    turn: s.turn,
    arena: s.arena,
    players: { player1: s.players.player1, player2: s.players.player2 },
    fences: s.fences,
    pendingAction: s.pendingAction,
    winner: s.winner,
    error: s.error,
    errorCode: s.errorCode,
  }
}

export default function VsComputerPage() {
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [profileUsername, setProfileUsername] = useState<string | null | undefined>(undefined)
  const [pokemonTeamLine, setPokemonTeamLine] = useState<string | null>(null)
  const [pokemonPickerOpen, setPokemonPickerOpen] = useState(false)
  const [pokemonPickerOptions, setPokemonPickerOptions] = useState<[StarterSpecies, StarterSpecies] | null>(
    null,
  )
  const [difficulty, setDifficulty] = useState<AiDifficulty>('normal')
  const [restartNonce, setRestartNonce] = useState(0)
  const [undoStack, setUndoStack] = useState<TurnSnapshot[]>([])
  const [redoStack, setRedoStack] = useState<TurnSnapshot[]>([])

  const profileFetchSeq = useRef(0)
  const snapshotStartHumanTurnRef = useRef<TurnSnapshot | null>(null)

  const turn = useGameStore((s) => s.turn)
  const actingUserId = useGameStore((s) => s.players[s.turn].id)
  const status = useGameStore((s) => s.status)
  const winner = useGameStore((s) => s.winner)

  useEffect(() => {
    let cancelled = false

    const applySession = (session: Session | null) => {
      if (cancelled) return
      const id = session?.user.id ?? null
      setSessionUserId(id)
      if (!id) {
        setProfileUsername(undefined)
        return
      }
      setProfileUsername(undefined)
      const seq = ++profileFetchSeq.current
      void supabase
        .from('profiles')
        .select('username')
        .eq('id', id)
        .maybeSingle()
        .then(({ data }) => {
          if (cancelled || seq !== profileFetchSeq.current) return
          setProfileUsername(data?.username ?? null)
        })
    }

    const scheduleApplySession = (session: Session | null) => {
      queueMicrotask(() => applySession(session))
    }

    void getSession().then(({ data: { session } }) => {
      scheduleApplySession(session)
    })

    const {
      data: { subscription },
    } = onAuthStateChange((_e, session) => {
      scheduleApplySession(session)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const humanId = sessionUserId ?? SYNTH_HUMAN_ID
    const display = buildAiPracticeMatchDisplay(sessionUserId, profileUsername)
    useGameStore.getState().initMatch(LOCAL_AI_PRACTICE_MATCH_ID, humanId, LOCAL_AI_OPPONENT_ID, display)
    useGameStore.getState().setPokemonSpecies('player2', pickRandomStarterSpeciesId())
    snapshotStartHumanTurnRef.current = pickTurnSnapshot(useGameStore.getState())

    queueMicrotask(() => {
      setUndoStack([])
      setRedoStack([])
    })

    queueMicrotask(() => {
      try {
        const rawPokemonTeam = sessionStorage.getItem(POKEMON_TEAM_PICK_STORAGE_KEY)
        const parsedPokemonTeam = parsePokemonTeamPickJson(rawPokemonTeam)
        setPokemonTeamLine(
          parsedPokemonTeam ? pokemonTeamPickLabel(parsedPokemonTeam, starterSpeciesById) : null,
        )

        const [idA, idB] = parsedPokemonTeam?.speciesIds ?? [null, null]
        const sa = idA ? starterSpeciesById(idA) : undefined
        const sb = idB ? starterSpeciesById(idB) : undefined
        if (parsedPokemonTeam && sa && sb) {
          useGameStore.getState().setPokemonSpecies('player1', null)
          setPokemonPickerOptions([sa, sb])
          setPokemonPickerOpen(true)
        } else {
          setPokemonPickerOpen(false)
          setPokemonPickerOptions(null)
        }
      } catch {
        setPokemonTeamLine(null)
        setPokemonPickerOpen(false)
        setPokemonPickerOptions(null)
      }
    })
  }, [sessionUserId, profileUsername, restartNonce])

  useEffect(() => {
    if (turn !== 'player2' || status !== 'active' || winner !== null) {
      return
    }

    let cancelled = false
    const tid = window.setTimeout(() => {
      if (cancelled) return
      const combined = buildGameStateSnapshot()
      const action = chooseAiPendingAction(combined, 'player2', difficulty)
      useGameStore.getState().setPendingAction(action)
      useGameStore.getState().commitAction({ actingUserId: LOCAL_AI_OPPONENT_ID })
      if (!cancelled) {
        snapshotStartHumanTurnRef.current = pickTurnSnapshot(useGameStore.getState())
      }
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(tid)
    }
  }, [turn, status, winner, difficulty])

  const handleNewGame = useCallback(() => {
    setRestartNonce((n) => n + 1)
  }, [])

  const handleUndo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev
      const snap = prev[prev.length - 1]!
      const current = pickTurnSnapshot(useGameStore.getState())
      useGameStore.getState().restoreTurnSnapshot(snap)
      snapshotStartHumanTurnRef.current = pickTurnSnapshot(useGameStore.getState())
      setRedoStack((r) => [...r, current])
      return prev.slice(0, -1)
    })
  }, [])

  const handleRedo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev
      const snap = prev[prev.length - 1]!
      const current = pickTurnSnapshot(useGameStore.getState())
      useGameStore.getState().restoreTurnSnapshot(snap)
      snapshotStartHumanTurnRef.current = pickTurnSnapshot(useGameStore.getState())
      setUndoStack((u) => [...u, current])
      return prev.slice(0, -1)
    })
  }, [])

  const afterHumanCommit = useCallback(() => {
    const refSnap = snapshotStartHumanTurnRef.current
    if (refSnap) {
      setUndoStack((u) => [...u, refSnap])
    }
    setRedoStack([])
  }, [])

  const trainerKeyForBoardPokemon = sessionUserId ?? SYNTH_HUMAN_ID

  const difficultyBtn = (d: AiDifficulty, label: string) => (
    <button
      key={d}
      type="button"
      onClick={() => setDifficulty(d)}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        difficulty === d
          ? 'bg-emerald-700 text-white dark:bg-emerald-600'
          : 'border border-zinc-300 bg-white text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex min-h-full flex-col items-center gap-4 px-4 pb-32 pt-8">
      {pokemonPickerOpen && pokemonPickerOptions && (
        <PokemonSpeciesPickerModal
          open
          options={pokemonPickerOptions}
          onConfirm={(speciesId) => {
            try {
              sessionStorage.setItem(
                BOARD_POKEMON_PICK_LOCAL_STORAGE_KEY,
                serializeBoardPokemonPick({ trainerKey: trainerKeyForBoardPokemon, speciesId }),
              )
            } catch {
              // ignore
            }
            useGameStore.getState().setPokemonSpecies('player1', speciesId)
            setPokemonPickerOpen(false)
          }}
        />
      )}

      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Practice vs computer
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Local only · not ranked
          {winner && ` · Winner: ${winner === 'player1' ? 'You' : 'Computer'}`}
          {status === 'finished' && ' · Game over'}
        </p>
        {pokemonTeamLine && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Pokemons: {pokemonTeamLine}</p>
        )}
        <p className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Difficulty</span>
          {difficultyBtn('beginner', 'Beginner')}
          {difficultyBtn('normal', 'Normal')}
          {difficultyBtn('hard', 'Hard')}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-100"
          >
            Undo turn pair
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-100"
          >
            Redo
          </button>
          <button
            type="button"
            onClick={handleNewGame}
            className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-200 dark:text-zinc-900"
          >
            New game
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
          <Link href="/play" className="underline">
            Pass-and-play board
          </Link>
          {' · '}
          <Link href="/lobby" className="underline">
            Lobby
          </Link>
        </p>
      </div>

      <PortraitOnlyGameShell>
        <Scoreboard localPlayerKey="player1" />

        <GameBoard localPlayerKey="player1" viewAsPlayer="player1" />

        <MobileActionTray
          actingUserId={actingUserId}
          afterSuccessfulCommit={(ctx) => {
            if (ctx.previousTurn === 'player1') {
              afterHumanCommit()
            }
          }}
        />
      </PortraitOnlyGameShell>
    </div>
  )
}
