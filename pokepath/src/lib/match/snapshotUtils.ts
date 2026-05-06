import type { GameState, PendingAction, PlayerKey } from '@/src/types/game'

export type TurnSnapshot = Pick<
  GameState,
  'turn' | 'players' | 'fences' | 'winner' | 'status' | 'pendingAction' | 'arena'
>

export function pickTurnSnapshot(s: GameState): TurnSnapshot {
  const pa: PendingAction =
    s.pendingAction.type === null
      ? { type: null }
      : {
          type: s.pendingAction.type,
          targetPos: s.pendingAction.targetPos ? { ...s.pendingAction.targetPos } : undefined,
          targetFence: s.pendingAction.targetFence
            ? { ...s.pendingAction.targetFence }
            : undefined,
        }
  return {
    arena: s.arena,
    turn: s.turn,
    players: {
      player1: {
        ...s.players.player1,
        pos: { ...s.players.player1.pos },
      },
      player2: {
        ...s.players.player2,
        pos: { ...s.players.player2.pos },
      },
    },
    fences: s.fences.map((f) => ({ ...f })),
    winner: s.winner,
    status: s.status,
    pendingAction: pa,
  }
}

/** Compare board snapshots ignoring display-only fields (username, elo). */
export function normalizedTurnSnapshotJson(
  s: Pick<GameState, 'turn' | 'players' | 'fences' | 'winner' | 'status' | 'pendingAction' | 'arena'>,
): string {
  const normPlayer = (pk: PlayerKey) => {
    const p = s.players[pk]
    const o: {
      id: string
      pos: { x: number; y: number }
      fencesLeft: number
      type: string
      pawnSpeciesId?: string
    } = {
      id: p.id,
      pos: p.pos,
      fencesLeft: p.fencesLeft,
      type: p.type,
    }
    if (p.pawnSpeciesId !== undefined && p.pawnSpeciesId !== '') {
      o.pawnSpeciesId = p.pawnSpeciesId
    }
    return o
  }
  return JSON.stringify({
    arena: s.arena,
    turn: s.turn,
    players: {
      player1: normPlayer('player1'),
      player2: normPlayer('player2'),
    },
    fences: s.fences,
    winner: s.winner,
    status: s.status,
    pendingAction: s.pendingAction,
  })
}

/**
 * Same as `normalizedTurnSnapshotJson` but omits `pawnSpeciesId` (board Pokémon art).
 * Use when validating realtime turn broadcasts: merge keeps species from the receiver's
 * store while the sender snapshot may omit the opponent's pick until DB sync.
 */
export function normalizedTurnSnapshotJsonIgnoringBoardPokemon(
  s: Pick<GameState, 'turn' | 'players' | 'fences' | 'winner' | 'status' | 'pendingAction' | 'arena'>,
): string {
  const normPlayer = (pk: PlayerKey) => {
    const p = s.players[pk]
    return {
      id: p.id,
      pos: p.pos,
      fencesLeft: p.fencesLeft,
      type: p.type,
    }
  }
  return JSON.stringify({
    arena: s.arena,
    turn: s.turn,
    players: {
      player1: normPlayer('player1'),
      player2: normPlayer('player2'),
    },
    fences: s.fences,
    winner: s.winner,
    status: s.status,
    pendingAction: s.pendingAction,
  })
}
