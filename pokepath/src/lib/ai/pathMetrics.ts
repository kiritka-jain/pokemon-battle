import { shortestPathLengthToGoal } from '@/src/lib/engine/pathfinding'
import type { Fence, GameState, PlayerKey, Position } from '@/src/types/game'

export function goalRowForPlayer(playerKey: PlayerKey): number {
  return playerKey === 'player1' ? 0 : 8
}

export function pathLengthForPlayer(
  pos: Position,
  playerKey: PlayerKey,
  fences: Fence[],
): number | null {
  return shortestPathLengthToGoal(pos, goalRowForPlayer(playerKey), fences)
}

export function pathLengthFromState(state: GameState, playerKey: PlayerKey): number | null {
  return pathLengthForPlayer(state.players[playerKey].pos, playerKey, state.fences)
}
