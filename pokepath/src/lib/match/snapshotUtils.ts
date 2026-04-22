import type { GameState, PendingAction, PlayerKey } from '@/src/types/game'

export type TurnSnapshot = Pick<
  GameState,
  'turn' | 'players' | 'fences' | 'winner' | 'status' | 'pendingAction'
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
  s: Pick<GameState, 'turn' | 'players' | 'fences' | 'winner' | 'status' | 'pendingAction'>,
): string {
  const normPlayer = (pk: PlayerKey) => ({
    id: s.players[pk].id,
    pos: s.players[pk].pos,
    fencesLeft: s.players[pk].fencesLeft,
    type: s.players[pk].type,
  })
  return JSON.stringify({
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
