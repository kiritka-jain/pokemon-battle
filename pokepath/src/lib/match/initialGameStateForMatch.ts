import type { GameState } from '@/src/types/game'

export function initialGameStateForMatch(match: {
  id: string
  player1_id: string
  player2_id: string
}): GameState {
  return {
    matchId: match.id,
    status: 'active',
    turn: 'player1',
    players: {
      player1: {
        id: match.player1_id,
        pos: { x: 4, y: 8 },
        fencesLeft: 10,
        type: 'Normal',
      },
      player2: {
        id: match.player2_id,
        pos: { x: 4, y: 0 },
        fencesLeft: 10,
        type: 'Normal',
      },
    },
    fences: [],
    pendingAction: { type: null },
    winner: null,
    error: null,
    errorCode: null,
  }
}
