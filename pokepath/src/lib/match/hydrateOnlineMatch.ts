import { displayNameForSeat } from '@/src/lib/playerDisplayName'
import {
  initialGameState,
  useGameStore,
  type InitMatchDisplay,
} from '@/src/lib/store/gameStore'
import type { PlayerState } from '@/src/types/game'

import { parsePersistedMatchState } from '@/src/lib/match/parsePersistedMatchState'

/**
 * When DB JSON omits `pawnSpeciesId`, keep the same seat's prior client value only for the
 * same match (avoids carrying a board Pokemon from a previous match into a new row hydrate).
 */
function mergeBoardPokemonSpeciesFromPrior(
  parsedSeat: PlayerState,
  priorSeat: PlayerState,
  matchId: string,
  priorMatchId: string | null,
): PlayerState {
  const fromDb = parsedSeat.pawnSpeciesId
  if (fromDb !== undefined && fromDb !== '') {
    return { ...parsedSeat, pawnSpeciesId: fromDb }
  }
  const priorSpecies = priorSeat.pawnSpeciesId
  if (
    priorSpecies !== undefined &&
    priorSpecies !== '' &&
    priorSeat.id === parsedSeat.id &&
    parsedSeat.id !== '' &&
    priorMatchId === matchId
  ) {
    return { ...parsedSeat, pawnSpeciesId: priorSpecies }
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
}): boolean {
  const prior = useGameStore.getState()
  const priorMatchId = prior.matchId

  useGameStore.setState(initialGameState)
  useGameStore.getState().initMatch(args.matchId, args.player1Id, args.player2Id, args.display)

  if (!args.gameState) return true

  const parsed = parsePersistedMatchState(args.gameState, {
    id: args.matchId,
    player1_id: args.player1Id,
    player2_id: args.player2Id,
  })
  if (!parsed) return false

  const p1 = mergeBoardPokemonSpeciesFromPrior(
    parsed.players.player1,
    prior.players.player1,
    args.matchId,
    priorMatchId,
  )
  const p2 = mergeBoardPokemonSpeciesFromPrior(
    parsed.players.player2,
    prior.players.player2,
    args.matchId,
    priorMatchId,
  )

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
  return true
}
