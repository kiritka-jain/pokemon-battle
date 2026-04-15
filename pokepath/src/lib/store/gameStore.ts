import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { getFenceId } from '@/src/lib/engine/boardUtils'
import { validateFencePlacement } from '@/src/lib/engine/fenceValidator'
import { validateMove } from '@/src/lib/engine/moveValidator'
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
  error: null,
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
          username: 'Player 1',
          elo: 1000,
        }
        draft.players.player2 = {
          id: player2Id,
          pos: { x: 4, y: 0 },
          fencesLeft: 10,
          type: 'Normal',
          username: 'Player 2',
          elo: 1000,
        }
        draft.fences = []
        draft.pendingAction = { type: null }
        draft.winner = null
        draft.error = null
      }),

    setPendingAction: (action) =>
      set((draft) => {
        draft.pendingAction = action
        draft.error = null
      }),

    clearPendingAction: () =>
      set((draft) => {
        draft.pendingAction = { type: null }
        draft.error = null
      }),

    commitAction: () =>
      set((draft) => {
        const pending = draft.pendingAction
        if (pending.type === null) {
          return
        }

        if (draft.status !== 'active' || draft.winner !== null) {
          draft.error = 'Game is not active'
          return
        }

        const playerKey = draft.turn
        const stateSnapshot = draft as GameState

        if (pending.type === 'move') {
          if (pending.targetPos === undefined) {
            draft.error = 'No move target'
            return
          }
          const result = validateMove(playerKey, pending.targetPos, stateSnapshot)
          if (!result.valid) {
            draft.error = result.reason ?? 'Invalid move'
            return
          }

          draft.players[playerKey].pos = pending.targetPos
          draft.pendingAction = { type: null }
          draft.error = null

          if (draft.players.player1.pos.y === 0) {
            draft.winner = 'player1'
            draft.status = 'finished'
            return
          }
          if (draft.players.player2.pos.y === 8) {
            draft.winner = 'player2'
            draft.status = 'finished'
            return
          }

          draft.turn = draft.turn === 'player1' ? 'player2' : 'player1'
          return
        }

        if (pending.type === 'fence') {
          if (pending.targetFence === undefined) {
            draft.error = 'No fence target'
            return
          }
          const { x, y, orientation } = pending.targetFence
          const result = validateFencePlacement(playerKey, x, y, orientation, stateSnapshot)
          if (!result.valid) {
            draft.error = result.reason ?? 'Invalid fence placement'
            return
          }

          draft.fences.push({
            id: getFenceId(x, y, orientation),
            x,
            y,
            orientation,
            placedBy: playerKey,
          })
          draft.players[playerKey].fencesLeft -= 1
          draft.pendingAction = { type: null }
          draft.error = null
          draft.turn = draft.turn === 'player1' ? 'player2' : 'player1'
        }
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
        if (partial.error !== undefined) draft.error = partial.error
      }),

    setWinner: (player) =>
      set((draft) => {
        draft.winner = player
        draft.status = 'finished'
      }),
  })),
)
