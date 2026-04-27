import { starterSpeciesById } from '@/src/lib/pokemon/starterRoster'
import type { GameState, PlayerKey, PlayerState } from '@/src/types/game'

function validatedBoardPokemonSpeciesId(id: unknown): string | undefined {
  if (typeof id !== 'string' || id === '') return undefined
  return starterSpeciesById(id) ? id : undefined
}

function withBoardPokemonSpecies(p: PlayerState, speciesId: string | undefined): PlayerState {
  const next: PlayerState = { ...p }
  if (speciesId !== undefined && speciesId !== '') {
    next.pawnSpeciesId = speciesId
  } else {
    delete next.pawnSpeciesId
  }
  return next
}

/**
 * After a validated turn, merge board Pokemon species ids: the actor's Pokemon may be taken
 * from the client's newState (validated roster id); the opponent's always comes from `base` (DB).
 */
export function mergeBoardPokemonAfterCommit(
  appliedNext: GameState,
  newState: Pick<GameState, 'players'>,
  base: GameState,
  actorKey: PlayerKey,
): GameState {
  const opponentKey: PlayerKey = actorKey === 'player1' ? 'player2' : 'player1'

  const actorFromClient = validatedBoardPokemonSpeciesId(newState.players[actorKey].pawnSpeciesId)
  const actorFinal =
    actorFromClient !== undefined ? actorFromClient : base.players[actorKey].pawnSpeciesId

  const opponentFinal = base.players[opponentKey].pawnSpeciesId

  return {
    ...appliedNext,
    players: {
      player1: withBoardPokemonSpecies(
        appliedNext.players.player1,
        actorKey === 'player1' ? actorFinal : opponentFinal,
      ),
      player2: withBoardPokemonSpecies(
        appliedNext.players.player2,
        actorKey === 'player2' ? actorFinal : opponentFinal,
      ),
    },
  }
}
