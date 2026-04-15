import type { Fence, FenceOrientation, Position } from '@/src/types/game'

/** Check if a position is within the 9x9 board */
export function isInBounds(pos: Position): boolean {
  return pos.x >= 0 && pos.x <= 8 && pos.y >= 0 && pos.y <= 8
}

/** Generate a unique fence ID (e.g. "h-3-3" or "v-5-2") */
export function getFenceId(x: number, y: number, orientation: FenceOrientation): string {
  const prefix = orientation === 'H' ? 'h' : 'v'
  return `${prefix}-${x}-${y}`
}

function fenceAt(
  fences: Fence[],
  x: number,
  y: number,
  orientation: FenceOrientation
): boolean {
  return fences.some((f) => f.orientation === orientation && f.x === x && f.y === y)
}

/**
 * Check if a wall/fence blocks movement from posA to posB.
 * posA and posB must be orthogonally adjacent (one step).
 */
export function isBlockedByFence(posA: Position, posB: Position, fences: Fence[]): boolean {
  const dx = posB.x - posA.x
  const dy = posB.y - posA.y
  if (Math.abs(dx) + Math.abs(dy) !== 1) return false

  const x = posA.x
  const y = posA.y

  if (dx === 0 && dy === -1) {
    return fenceAt(fences, x, y - 1, 'H') || fenceAt(fences, x - 1, y - 1, 'H')
  }
  if (dx === 0 && dy === 1) {
    return fenceAt(fences, x, y, 'H') || fenceAt(fences, x - 1, y, 'H')
  }
  if (dx === 1 && dy === 0) {
    return fenceAt(fences, x, y, 'V') || fenceAt(fences, x, y - 1, 'V')
  }
  if (dx === -1 && dy === 0) {
    return fenceAt(fences, x - 1, y, 'V') || fenceAt(fences, x - 1, y - 1, 'V')
  }

  return false
}

/** All reachable orthogonal neighbors from pos, respecting fences and board edges */
export function getNeighbors(pos: Position, fences: Fence[]): Position[] {
  const next: Position[] = [
    { x: pos.x, y: pos.y - 1 },
    { x: pos.x, y: pos.y + 1 },
    { x: pos.x - 1, y: pos.y },
    { x: pos.x + 1, y: pos.y },
  ]

  const neighbors: Position[] = []
  for (const p of next) {
    if (!isInBounds(p)) continue
    if (isBlockedByFence(pos, p, fences)) continue
    neighbors.push(p)
  }
  return neighbors
}
