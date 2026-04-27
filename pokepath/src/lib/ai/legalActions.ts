import { validateFencePlacement } from '@/src/lib/engine/fenceValidator'
import { validateMove } from '@/src/lib/engine/moveValidator'
import type { FenceOrientation, GameState, PendingAction, PlayerKey, Position } from '@/src/types/game'

export function listLegalMoves(state: GameState, playerKey: PlayerKey): Position[] {
  const out: Position[] = []
  for (let x = 0; x <= 8; x++) {
    for (let y = 0; y <= 8; y++) {
      const targetPos: Position = { x, y }
      if (validateMove(playerKey, targetPos, state).valid) {
        out.push(targetPos)
      }
    }
  }
  return out
}

export function listLegalFences(
  state: GameState,
  playerKey: PlayerKey,
): { x: number; y: number; orientation: FenceOrientation }[] {
  const out: { x: number; y: number; orientation: FenceOrientation }[] = []
  for (let x = 0; x <= 7; x++) {
    for (let y = 0; y <= 7; y++) {
      for (const orientation of ['H', 'V'] as const) {
        if (validateFencePlacement(playerKey, x, y, orientation, state).valid) {
          out.push({ x, y, orientation })
        }
      }
    }
  }
  return out
}

export function allLegalPendingActions(state: GameState, playerKey: PlayerKey): PendingAction[] {
  const moves = listLegalMoves(state, playerKey).map(
    (targetPos): PendingAction => ({ type: 'move', targetPos }),
  )
  const fences = listLegalFences(state, playerKey).map(
    (targetFence): PendingAction => ({ type: 'fence', targetFence }),
  )
  return [...moves, ...fences]
}
