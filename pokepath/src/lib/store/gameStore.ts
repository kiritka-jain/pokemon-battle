import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import type { GameState, PendingAction, PlayerKey } from '@/src/types/game'

export const initialGameState: GameState = {
  matchId: null,
  status: 'waiting',
  turn: 'player1',
  players: {
    player1: { id: '', pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
    player2: { id: '', pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
  },
  fences: [],
  pendingAction: { type: null },
  winner: null,
}

type GameStore = GameState & {
  initMatch: (matchId: string, player1Id: string, player2Id: string) => void
  setPendingAction: (action: PendingAction) => void
  clearPendingAction: () => void
  commitAction: () => void
  applyOpponentAction: (partial: Partial<GameState>) => void
  setWinner: (player: PlayerKey) => void
}

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    ...initialGameState,

    initMatch: (matchId, player1Id, player2Id) =>
      set((draft) => {
        draft.matchId = matchId
        draft.status = 'active'
        draft.turn = 'player1'
        draft.players.player1 = {
          id: player1Id,
          pos: { x: 4, y: 8 },
          fencesLeft: 10,
          type: 'Normal',
        }
        draft.players.player2 = {
          id: player2Id,
          pos: { x: 4, y: 0 },
          fencesLeft: 10,
          type: 'Normal',
        }
        draft.fences = []
        draft.pendingAction = { type: null }
        draft.winner = null
      }),

    setPendingAction: (action) =>
      set((draft) => {
        draft.pendingAction = action
      }),

    clearPendingAction: () =>
      set((draft) => {
        draft.pendingAction = { type: null }
      }),

    commitAction: () =>
      set((draft) => {
        draft.turn = draft.turn === 'player1' ? 'player2' : 'player1'
        draft.pendingAction = { type: null }
      }),

    applyOpponentAction: (partial) =>
      set((draft) => {
        if (partial.matchId !== undefined) draft.matchId = partial.matchId
        if (partial.status !== undefined) draft.status = partial.status
        if (partial.turn !== undefined) draft.turn = partial.turn
        if (partial.players !== undefined) {
          if (partial.players.player1 !== undefined) {
            Object.assign(draft.players.player1, partial.players.player1)
          }
          if (partial.players.player2 !== undefined) {
            Object.assign(draft.players.player2, partial.players.player2)
          }
        }
        if (partial.fences !== undefined) draft.fences = partial.fences
        if (partial.pendingAction !== undefined) {
          draft.pendingAction = partial.pendingAction
        }
        if (partial.winner !== undefined) draft.winner = partial.winner
      }),

    setWinner: (player) =>
      set((draft) => {
        draft.winner = player
        draft.status = 'finished'
      }),
  })),
)
