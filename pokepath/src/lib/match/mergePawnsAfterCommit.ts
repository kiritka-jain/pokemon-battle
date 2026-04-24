import { starterSpeciesById } from '@/src/lib/pokemon/starterRoster'
import type { GameState, PlayerKey, PlayerState } from '@/src/types/game'

function validatedPawnSpeciesId(id: unknown): string | undefined {
  if (typeof id !== 'string' || id === '') return undefined
  return starterSpeciesById(id) ? id : undefined
}

function withPawn(p: PlayerState, pawn: string | undefined): PlayerState {
  const next: PlayerState = { ...p }
  if (pawn !== undefined && pawn !== '') {
    next.pawnSpeciesId = pawn
  } else {
    delete next.pawnSpeciesId
  }
  return next
}

/**
 * After a validated turn, merge board pawn ids: actor's pawn may be taken from the
 * client's newState (validated roster id); opponent's pawn always comes from `base` (DB).
 */
export function mergePawnsAfterCommit(
  appliedNext: GameState,
  newState: Pick<GameState, 'players'>,
  base: GameState,
  actorKey: PlayerKey,
): GameState {
  const opponentKey: PlayerKey = actorKey === 'player1' ? 'player2' : 'player1'

  const actorFromClient = validatedPawnSpeciesId(newState.players[actorKey].pawnSpeciesId)
  const actorFinal =
    actorFromClient !== undefined ? actorFromClient : base.players[actorKey].pawnSpeciesId

  const opponentFinal = base.players[opponentKey].pawnSpeciesId

  return {
    ...appliedNext,
    players: {
      player1: withPawn(
        appliedNext.players.player1,
        actorKey === 'player1' ? actorFinal : opponentFinal,
      ),
      player2: withPawn(
        appliedNext.players.player2,
        actorKey === 'player2' ? actorFinal : opponentFinal,
      ),
    },
  }
}
