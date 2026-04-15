import type { FenceOrientation, GameState, PlayerKey } from '@/src/types/game'

import { getFenceId } from './boardUtils'
import { hasPathToGoal } from './pathfinding'

export interface FenceValidationResult {
  valid: boolean
  reason?: string
}

function fenceExists(
  fences: GameState['fences'],
  x: number,
  y: number,
  orientation: FenceOrientation
): boolean {
  return fences.some((f) => f.x === x && f.y === y && f.orientation === orientation)
}

export function validateFencePlacement(
  playerKey: PlayerKey,
  x: number,
  y: number,
  orientation: FenceOrientation,
  gameState: GameState
): FenceValidationResult {
  if (gameState.turn !== playerKey) {
    return { valid: false, reason: 'Not your turn' }
  }

  if (gameState.players[playerKey].fencesLeft <= 0) {
    return { valid: false, reason: 'No fences remaining' }
  }

  if (x < 0 || x > 7 || y < 0 || y > 7) {
    return { valid: false, reason: 'Out of bounds' }
  }

  if (fenceExists(gameState.fences, x, y, orientation)) {
    return { valid: false, reason: 'Duplicate fence' }
  }

  if (orientation === 'H') {
    if (fenceExists(gameState.fences, x - 1, y, 'H') || fenceExists(gameState.fences, x + 1, y, 'H')) {
      return { valid: false, reason: 'Overlapping fences' }
    }
  } else {
    if (fenceExists(gameState.fences, x, y - 1, 'V') || fenceExists(gameState.fences, x, y + 1, 'V')) {
      return { valid: false, reason: 'Overlapping fences' }
    }
  }

  if (fenceExists(gameState.fences, x, y, orientation === 'H' ? 'V' : 'H')) {
    return { valid: false, reason: 'Fences would cross' }
  }

  const newFence: GameState['fences'][number] = {
    id: getFenceId(x, y, orientation),
    x,
    y,
    orientation,
    placedBy: playerKey,
  }
  const tempFences = [...gameState.fences, newFence]

  if (!hasPathToGoal(gameState.players.player1.pos, 0, tempFences)) {
    return { valid: false, reason: "Would block Player 1's path" }
  }
  if (!hasPathToGoal(gameState.players.player2.pos, 8, tempFences)) {
    return { valid: false, reason: "Would block Player 2's path" }
  }

  return { valid: true }
}
