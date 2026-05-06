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
 * After a validated turn, merge board Pokemon species ids: the actor's species may come from
 * newState (validated roster id) or base; the opponent's comes from base when present, otherwise
 * from newState (validated) so the first persisted turn can retain honest dual-pick clients.
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

  const opponentFromBase = base.players[opponentKey].pawnSpeciesId
  const opponentFromClient = validatedBoardPokemonSpeciesId(newState.players[opponentKey].pawnSpeciesId)
  const opponentFinal =
    opponentFromBase !== undefined && opponentFromBase !== ''
      ? opponentFromBase
      : opponentFromClient

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
