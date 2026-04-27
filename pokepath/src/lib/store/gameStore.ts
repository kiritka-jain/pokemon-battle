import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { getFenceId } from '@/src/lib/engine/boardUtils'
import { validateFencePlacement } from '@/src/lib/engine/fenceValidator'
import { validateMove } from '@/src/lib/engine/moveValidator'
import { resolveArenaForMatch } from '@/src/lib/board/arenaForMatch'
import { LOCAL_DEV_MATCH_ID } from '@/src/lib/match/localDevMatchId'
import { displayNameForSeat } from '@/src/lib/playerDisplayName'
import type { GameState, PendingAction, PlayerKey } from '@/src/types/game'

export { LOCAL_DEV_MATCH_ID } from '@/src/lib/match/localDevMatchId'

export const initialGameState: GameState = {
  matchId: null,
  status: 'waiting',
  turn: 'player1',
  arena: 'grass',
  players: {
    player1: { id: '', pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
    player2: { id: '', pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
  },
  fences: [],
  pendingAction: { type: null },
  winner: null,
  error: null,
  errorCode: null,
}

export type InitMatchDisplay = {
  player1Username?: string
  player2Username?: string
  player1Elo?: number
  player2Elo?: number
}

type GameStore = GameState & {
  initMatch: (
    matchId: string,
    player1Id: string,
    player2Id: string,
    display?: InitMatchDisplay,
  ) => void
  setPendingAction: (action: PendingAction) => void
  clearPendingAction: () => void
  commitAction: (args: { actingUserId: string }) => void
  clearCommitErrorCode: () => void
  applyOpponentAction: (partial: Partial<GameState>) => void
  /** Undo a local commit when persistence fails (multiplayer). */
  restoreTurnSnapshot: (
    snapshot: Pick<
      GameState,
      'turn' | 'players' | 'fences' | 'winner' | 'status' | 'pendingAction' | 'arena'
    >,
  ) => void
  setWinner: (player: PlayerKey) => void
  setPokemonSpecies: (playerKey: PlayerKey, speciesId: string | null) => void
}

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    ...initialGameState,

    initMatch: (matchId, player1Id, player2Id, display) =>
      set((draft) => {
        draft.matchId = matchId
        draft.status = 'active'
        draft.turn = 'player1'
        draft.players.player1 = {
          id: player1Id,
          pos: { x: 4, y: 8 },
          fencesLeft: 10,
          type: 'Normal',
          username: displayNameForSeat({
            username: display?.player1Username,
            userId: player1Id,
          }),
          elo: display?.player1Elo ?? 1000,
        }
        draft.players.player2 = {
          id: player2Id,
          pos: { x: 4, y: 0 },
          fencesLeft: 10,
          type: 'Normal',
          username: displayNameForSeat({
            username: display?.player2Username,
            userId: player2Id,
          }),
          elo: display?.player2Elo ?? 1000,
        }
        draft.fences = []
        draft.pendingAction = { type: null }
        draft.winner = null
        draft.error = null
        draft.errorCode = null
        draft.arena = resolveArenaForMatch(matchId)
      }),

    setPendingAction: (action) =>
      set((draft) => {
        draft.pendingAction = action
        draft.error = null
        draft.errorCode = null
      }),

    clearPendingAction: () =>
      set((draft) => {
        draft.pendingAction = { type: null }
        draft.error = null
        draft.errorCode = null
      }),

    clearCommitErrorCode: () =>
      set((draft) => {
        draft.errorCode = null
      }),

    commitAction: ({ actingUserId }) =>
      set((draft) => {
        const pending = draft.pendingAction
        if (pending.type === null) {
          return
        }

        if (draft.status !== 'active' || draft.winner !== null) {
          draft.error = 'Game is not active'
          draft.errorCode = null
          return
        }

        const skipActorCheck = draft.matchId === LOCAL_DEV_MATCH_ID
        if (!skipActorCheck && draft.players[draft.turn].id !== actingUserId) {
          draft.error = 'Not your turn'
          draft.errorCode = null
          return
        }

        const playerKey = draft.turn
        const stateSnapshot = draft as GameState

        if (pending.type === 'move') {
          if (pending.targetPos === undefined) {
            draft.error = 'No move target'
            draft.errorCode = null
            return
          }
          const result = validateMove(playerKey, pending.targetPos, stateSnapshot)
          if (!result.valid) {
            draft.error = result.reason ?? 'Invalid move'
            draft.errorCode = null
            return
          }

          draft.players[playerKey].pos = pending.targetPos
          draft.pendingAction = { type: null }
          draft.error = null
          draft.errorCode = null

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
            draft.errorCode = null
            return
          }
          const { x, y, orientation } = pending.targetFence
          const result = validateFencePlacement(playerKey, x, y, orientation, stateSnapshot)
          if (!result.valid) {
            if (result.code) {
              draft.error = null
              draft.errorCode = result.code
            } else {
              draft.error = result.reason ?? 'Invalid fence placement'
              draft.errorCode = null
            }
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
          draft.errorCode = null
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
        if (partial.errorCode !== undefined) draft.errorCode = partial.errorCode
        if (partial.arena !== undefined) draft.arena = partial.arena
      }),

    restoreTurnSnapshot: (snapshot) =>
      set((draft) => {
        draft.turn = snapshot.turn
        draft.status = snapshot.status
        draft.winner = snapshot.winner
        draft.pendingAction = snapshot.pendingAction
        draft.arena = snapshot.arena
        draft.fences = snapshot.fences.map((f) => ({ ...f }))
        draft.players.player1 = {
          ...draft.players.player1,
          ...snapshot.players.player1,
          pos: { ...snapshot.players.player1.pos },
        }
        draft.players.player2 = {
          ...draft.players.player2,
          ...snapshot.players.player2,
          pos: { ...snapshot.players.player2.pos },
        }
        draft.error = null
        draft.errorCode = null
      }),

    setWinner: (player) =>
      set((draft) => {
        draft.winner = player
        draft.status = 'finished'
      }),

    setPokemonSpecies: (playerKey, speciesId) =>
      set((draft) => {
        if (speciesId === null) {
          delete draft.players[playerKey].pawnSpeciesId
        } else {
          draft.players[playerKey].pawnSpeciesId = speciesId
        }
      }),
  })),
)
