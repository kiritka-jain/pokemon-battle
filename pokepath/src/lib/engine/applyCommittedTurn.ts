import { getFenceId } from '@/src/lib/engine/boardUtils'
import { validateFencePlacement } from '@/src/lib/engine/fenceValidator'
import { validateMove } from '@/src/lib/engine/moveValidator'
import type { GameState, PendingAction, PlayerKey } from '@/src/types/game'

export type ApplyCommittedResult =
  | { ok: true; next: GameState }
  | { ok: false; reason: string; errorCode?: 'TRAP_OPPONENT' }

/** Pure mirror of `gameStore.commitAction` for a resolved pending action (server + tests). */
export function applyCommittedTurn(
  state: GameState,
  actorKey: PlayerKey,
  pending: PendingAction,
): ApplyCommittedResult {
  if (pending.type === null) {
    return { ok: false, reason: 'No action' }
  }
  if (state.status !== 'active' || state.winner !== null) {
    return { ok: false, reason: 'Game is not active' }
  }
  if (state.turn !== actorKey) {
    return { ok: false, reason: 'Not actor turn' }
  }

  const next: GameState = {
    ...state,
    players: {
      player1: { ...state.players.player1, pos: { ...state.players.player1.pos } },
      player2: { ...state.players.player2, pos: { ...state.players.player2.pos } },
    },
    fences: state.fences.map((f) => ({ ...f })),
    pendingAction: { type: null },
    error: null,
    errorCode: null,
  }

  if (pending.type === 'move') {
    if (pending.targetPos === undefined) {
      return { ok: false, reason: 'No move target' }
    }
    const result = validateMove(actorKey, pending.targetPos, state)
    if (!result.valid) {
      return { ok: false, reason: result.reason ?? 'Invalid move' }
    }
    next.players[actorKey].pos = { ...pending.targetPos }

    if (next.players.player1.pos.y === 0) {
      next.winner = 'player1'
      next.status = 'finished'
      return { ok: true, next }
    }
    if (next.players.player2.pos.y === 8) {
      next.winner = 'player2'
      next.status = 'finished'
      return { ok: true, next }
    }
    next.turn = next.turn === 'player1' ? 'player2' : 'player1'
    return { ok: true, next }
  }

  if (pending.type === 'fence') {
    if (pending.targetFence === undefined) {
      return { ok: false, reason: 'No fence target' }
    }
    const { x, y, orientation } = pending.targetFence
    const result = validateFencePlacement(actorKey, x, y, orientation, state)
    if (!result.valid) {
      if (result.code === 'TRAP_OPPONENT') {
        return { ok: false, reason: result.reason ?? 'Invalid fence', errorCode: 'TRAP_OPPONENT' }
      }
      return { ok: false, reason: result.reason ?? 'Invalid fence placement' }
    }
    next.fences.push({
      id: getFenceId(x, y, orientation),
      x,
      y,
      orientation,
      placedBy: actorKey,
    })
    next.players[actorKey].fencesLeft -= 1
    next.turn = next.turn === 'player1' ? 'player2' : 'player1'
    return { ok: true, next }
  }

  return { ok: false, reason: 'Unknown action' }
}
