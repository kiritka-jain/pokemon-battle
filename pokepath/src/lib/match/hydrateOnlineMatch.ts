import { displayNameForSeat } from '@/src/lib/playerDisplayName'
import {
  initialGameState,
  useGameStore,
  type InitMatchDisplay,
} from '@/src/lib/store/gameStore'
import type { PlayerState } from '@/src/types/game'

import { parsePersistedMatchState } from '@/src/lib/match/parsePersistedMatchState'

/** When DB JSON omits `pawnSpeciesId`, keep the same seat's prior client value if user ids still match. */
function mergePawnFromPrior(parsedSeat: PlayerState, priorSeat: PlayerState): PlayerState {
  const fromDb = parsedSeat.pawnSpeciesId
  if (fromDb !== undefined && fromDb !== '') {
    return { ...parsedSeat, pawnSpeciesId: fromDb }
  }
  const priorPawn = priorSeat.pawnSpeciesId
  if (
    priorPawn !== undefined &&
    priorPawn !== '' &&
    priorSeat.id === parsedSeat.id &&
    parsedSeat.id !== ''
  ) {
    return { ...parsedSeat, pawnSpeciesId: priorPawn }
  }
  return { ...parsedSeat }
}

/** Reset store, init seats from profiles, then overlay persisted board if any. */
export function hydrateOnlineMatchFromRow(args: {
  matchId: string
  player1Id: string
  player2Id: string
  gameState: unknown | null
  display: InitMatchDisplay
}) {
  const prior = useGameStore.getState()

  useGameStore.setState(initialGameState)
  useGameStore.getState().initMatch(args.matchId, args.player1Id, args.player2Id, args.display)

  if (!args.gameState) return

  const parsed = parsePersistedMatchState(args.gameState, {
    id: args.matchId,
    player1_id: args.player1Id,
    player2_id: args.player2Id,
  })
  if (!parsed) return

  const p1 = mergePawnFromPrior(parsed.players.player1, prior.players.player1)
  const p2 = mergePawnFromPrior(parsed.players.player2, prior.players.player2)

  useGameStore.setState({
    turn: parsed.turn,
    status: parsed.status,
    winner: parsed.winner,
    arena: parsed.arena,
    fences: parsed.fences,
    pendingAction: parsed.pendingAction,
    players: {
      player1: {
        ...p1,
        username: displayNameForSeat({
          username: args.display.player1Username,
          userId: args.player1Id,
        }),
        elo: args.display.player1Elo ?? 1000,
      },
      player2: {
        ...p2,
        username: displayNameForSeat({
          username: args.display.player2Username,
          userId: args.player2Id,
        }),
        elo: args.display.player2Elo ?? 1000,
      },
    },
  })
}
