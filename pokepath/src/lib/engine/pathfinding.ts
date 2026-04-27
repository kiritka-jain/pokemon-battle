import type { Fence, Position } from '@/src/types/game'

import { getNeighbors } from './boardUtils'

/**
 * Returns true if the player at `startPos` can reach any tile in `targetRow`
 * given the current set of fences on the board.
 *
 * @param startPos - The player's current position
 * @param targetRow - The y-coordinate the player must reach (0 for P1, 8 for P2)
 * @param fences - All currently placed fences on the board
 * @returns boolean - true if a path exists
 */
export function hasPathToGoal(
  startPos: Position,
  targetRow: number,
  fences: Fence[]
): boolean {
  const queue: Position[] = [startPos]
  const visited = new Set<string>([`${startPos.x},${startPos.y}`])

  while (queue.length > 0) {
    const current = queue.shift()!
    if (current.y === targetRow) {
      return true
    }
    for (const neighbor of getNeighbors(current, fences)) {
      const key = `${neighbor.x},${neighbor.y}`
      if (!visited.has(key)) {
        visited.add(key)
        queue.push(neighbor)
      }
    }
  }

  return false
}

/**
 * Minimum orthogonal steps from `startPos` to any cell on `targetRow`, or null if unreachable.
 * One step = one edge in the same graph as `hasPathToGoal` / `getNeighbors`.
 */
export function shortestPathLengthToGoal(
  startPos: Position,
  targetRow: number,
  fences: Fence[]
): number | null {
  if (startPos.y === targetRow) {
    return 0
  }
  const queue: Position[] = [startPos]
  const dist = new Map<string, number>([[`${startPos.x},${startPos.y}`, 0]])

  while (queue.length > 0) {
    const current = queue.shift()!
    const d = dist.get(`${current.x},${current.y}`)!
    for (const neighbor of getNeighbors(current, fences)) {
      const key = `${neighbor.x},${neighbor.y}`
      if (dist.has(key)) {
        continue
      }
      const nextDist = d + 1
      if (neighbor.y === targetRow) {
        return nextDist
      }
      dist.set(key, nextDist)
      queue.push(neighbor)
    }
  }

  return null
}
