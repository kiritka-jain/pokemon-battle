import type { GameState, PlayerKey, Position } from '@/src/types/game'

import { isBlockedByFence, isInBounds } from './boardUtils'

export interface MoveValidationResult {
  valid: boolean
  reason?: string
}

function opponentOf(playerKey: PlayerKey): PlayerKey {
  return playerKey === 'player1' ? 'player2' : 'player1'
}

function samePos(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y
}

/** True if a straight jump from current over opponent to K is fully legal (geometry + fences). */
function straightJumpOpen(
  currentPos: Position,
  opponentPos: Position,
  k: Position,
  fences: GameState['fences']
): boolean {
  return (
    isInBounds(k) &&
    !isBlockedByFence(currentPos, opponentPos, fences) &&
    !isBlockedByFence(opponentPos, k, fences)
  )
}

/** Orthogonal dodge squares when straight landing behind opponent is blocked */
function dodgeTargetsFrom(currentPos: Position, opponentPos: Position): [Position, Position] {
  const ux = opponentPos.x - currentPos.x
  const uy = opponentPos.y - currentPos.y
  const p1: Position = { x: opponentPos.x - uy, y: opponentPos.y + ux }
  const p2: Position = { x: opponentPos.x + uy, y: opponentPos.y - ux }
  return [p1, p2]
}

/** Diagonal step can use horizontal-first or vertical-first L-path; cannot pass through opponent cell */
function diagonalFencePathClear(
  from: Position,
  to: Position,
  opponentPos: Position,
  fences: GameState['fences']
): boolean {
  const midH: Position = { x: to.x, y: from.y }
  const midV: Position = { x: from.x, y: to.y }

  const tryPath = (mid: Position): boolean => {
    if (samePos(mid, opponentPos)) return false
    if (!isInBounds(mid)) return false
    return (
      !isBlockedByFence(from, mid, fences) &&
      !isBlockedByFence(mid, to, fences)
    )
  }

  return tryPath(midH) || tryPath(midV)
}

export function validateMove(
  playerKey: PlayerKey,
  targetPos: Position,
  gameState: GameState
): MoveValidationResult {
  if (gameState.turn !== playerKey) {
    return { valid: false, reason: 'Not your turn' }
  }

  if (!isInBounds(targetPos)) {
    return { valid: false, reason: 'Out of bounds' }
  }

  const currentPos = gameState.players[playerKey].pos
  const dx = targetPos.x - currentPos.x
  const dy = targetPos.y - currentPos.y
  const adx = Math.abs(dx)
  const ady = Math.abs(dy)
  const fences = gameState.fences
  const oppKey = opponentOf(playerKey)
  const opponentPos = gameState.players[oppKey].pos

  if (dx === 0 && dy === 0) {
    return { valid: false, reason: 'Invalid move distance' }
  }

  // 4. Simple orthogonal move
  if (adx + ady === 1) {
    if (isBlockedByFence(currentPos, targetPos, fences)) {
      return { valid: false, reason: 'Blocked by fence' }
    }
    if (samePos(targetPos, opponentPos)) {
      // Cannot land on opponent with a single step; jump / dodge use other cases
    } else {
      return { valid: true }
    }
  }

  // 5. Straight jump over opponent
  if (adx + ady === 2 && (dx === 0 || dy === 0)) {
    const midPos: Position = {
      x: currentPos.x + dx / 2,
      y: currentPos.y + dy / 2,
    }
    if (!samePos(midPos, opponentPos)) {
      return { valid: false, reason: 'Invalid move distance' }
    }
    if (isBlockedByFence(currentPos, midPos, fences)) {
      return { valid: false, reason: 'Blocked by fence' }
    }
    if (isBlockedByFence(midPos, targetPos, fences)) {
      return { valid: false, reason: 'Blocked by fence' }
    }
    if (samePos(targetPos, opponentPos)) {
      return { valid: false, reason: 'Invalid move distance' }
    }
    return { valid: true }
  }

  // 6. Diagonal dodge jump
  if (adx === 1 && ady === 1) {
    const uxm = opponentPos.x - currentPos.x
    const uym = opponentPos.y - currentPos.y
    if (Math.abs(uxm) + Math.abs(uym) !== 1) {
      return { valid: false, reason: 'Invalid move distance' }
    }

    const behind: Position = {
      x: opponentPos.x + uxm,
      y: opponentPos.y + uym,
    }
    const straightOk = straightJumpOpen(currentPos, opponentPos, behind, fences)
    if (straightOk) {
      return { valid: false, reason: 'Invalid move distance' }
    }

    const [d1, d2] = dodgeTargetsFrom(currentPos, opponentPos)
    const matchesDodge = samePos(targetPos, d1) || samePos(targetPos, d2)
    if (!matchesDodge) {
      return { valid: false, reason: 'Invalid move distance' }
    }

    if (!diagonalFencePathClear(currentPos, targetPos, opponentPos, fences)) {
      return { valid: false, reason: 'Blocked by fence' }
    }

    return { valid: true }
  }

  return { valid: false, reason: 'Invalid move distance' }
}
