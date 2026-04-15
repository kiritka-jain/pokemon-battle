import { describe, expect, it } from 'vitest'

import type { Fence } from '@/src/types/game'

import { getFenceId } from './boardUtils'
import { hasPathToGoal } from './pathfinding'

const fence = (partial: Omit<Fence, 'placedBy'> & { placedBy?: Fence['placedBy'] }): Fence => ({
  placedBy: 'player1',
  ...partial,
})

/** Horizontal fences along the boundary between row `fy` and `fy + 1`, covering all columns */
function fullHorizontalWall(fy: number): Fence[] {
  const anchors = [0, 2, 4, 6, 7] as const
  return anchors.map((x) =>
    fence({
      id: getFenceId(x, fy, 'H'),
      x,
      y: fy,
      orientation: 'H',
    })
  )
}

describe('hasPathToGoal', () => {
  it('open board: P1 at (4,8) can reach row 0', () => {
    expect(hasPathToGoal({ x: 4, y: 8 }, 0, [])).toBe(true)
  })

  it('open board: P2 at (4,0) can reach row 8', () => {
    expect(hasPathToGoal({ x: 4, y: 0 }, 8, [])).toBe(true)
  })

  it('horizontal wall blocks P1 from ever reaching row 0', () => {
    const fences = fullHorizontalWall(6)
    expect(hasPathToGoal({ x: 4, y: 8 }, 0, fences)).toBe(false)
  })

  it('partial wall with a gap: P1 can reach row 0', () => {
    const fences = fullHorizontalWall(6).filter((f) => f.x !== 4)
    expect(hasPathToGoal({ x: 4, y: 8 }, 0, fences)).toBe(true)
  })

  it('single fence does not block when a path still exists', () => {
    const fences: Fence[] = [
      fence({
        id: getFenceId(3, 3, 'H'),
        x: 3,
        y: 3,
        orientation: 'H',
      }),
    ]
    expect(hasPathToGoal({ x: 4, y: 8 }, 0, fences)).toBe(true)
  })

  it('returns true when already on the goal row', () => {
    expect(hasPathToGoal({ x: 3, y: 0 }, 0, [])).toBe(true)
    expect(hasPathToGoal({ x: 5, y: 8 }, 8, [])).toBe(true)
  })
})
