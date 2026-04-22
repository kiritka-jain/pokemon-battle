import { displayNameForSeat } from '@/src/lib/playerDisplayName'
import {
  initialGameState,
  useGameStore,
  type InitMatchDisplay,
} from '@/src/lib/store/gameStore'

import { parsePersistedMatchState } from '@/src/lib/match/parsePersistedMatchState'

/** Reset store, init seats from profiles, then overlay persisted board if any. */
export function hydrateOnlineMatchFromRow(args: {
  matchId: string
  player1Id: string
  player2Id: string
  gameState: unknown | null
  display: InitMatchDisplay
}) {
  useGameStore.setState(initialGameState)
  useGameStore.getState().initMatch(args.matchId, args.player1Id, args.player2Id, args.display)

  if (!args.gameState) return

  const parsed = parsePersistedMatchState(args.gameState, {
    id: args.matchId,
    player1_id: args.player1Id,
    player2_id: args.player2Id,
  })
  if (!parsed) return

  useGameStore.setState({
    turn: parsed.turn,
    status: parsed.status,
    winner: parsed.winner,
    fences: parsed.fences,
    pendingAction: parsed.pendingAction,
    players: {
      player1: {
        ...parsed.players.player1,
        username: displayNameForSeat({
          username: args.display.player1Username,
          userId: args.player1Id,
        }),
        elo: args.display.player1Elo ?? 1000,
      },
      player2: {
        ...parsed.players.player2,
        username: displayNameForSeat({
          username: args.display.player2Username,
          userId: args.player2Id,
        }),
        elo: args.display.player2Elo ?? 1000,
      },
    },
  })
}
