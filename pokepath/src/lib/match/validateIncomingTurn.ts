import { validateFencePlacement } from '@/src/lib/engine/fenceValidator'
import { validateMove } from '@/src/lib/engine/moveValidator'
import type { GameState, PendingAction, PlayerKey } from '@/src/types/game'

/** Map Supabase user id to seat; used to verify broadcast `fromUserId` (ticket 3.3). */
export function playerKeyForUserId(state: GameState, userId: string): PlayerKey | null {
  if (state.players.player1.id === userId) return 'player1'
  if (state.players.player2.id === userId) return 'player2'
  return null
}

/** Validate that `action` is legal for `actorKey` on `state` (opponent's committed turn). */
export function validateIncomingTurn(
  state: GameState,
  action: PendingAction,
  actorKey: PlayerKey,
): boolean {
  if (action.type === null) return false
  if (state.turn !== actorKey) return false

  if (action.type === 'move') {
    if (action.targetPos === undefined) return false
    return validateMove(actorKey, action.targetPos, state).valid
  }

  if (action.type === 'fence') {
    if (action.targetFence === undefined) return false
    const { x, y, orientation } = action.targetFence
    return validateFencePlacement(actorKey, x, y, orientation, state).valid
  }

  return false
}
