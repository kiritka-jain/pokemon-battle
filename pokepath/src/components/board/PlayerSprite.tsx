'use client'

import { useGameStore } from '@/src/lib/store/gameStore'

/**
 * Renders both trainers as absolutely positioned layers over the board grid.
 */
export function PlayerSprites() {
  const p1 = useGameStore((s) => s.players.player1.pos)
  const p2 = useGameStore((s) => s.players.player2.pos)

  const styleFor = (x: number, y: number) => ({
    left: `${((x + 0.5) / 9) * 100}%`,
    top: `${((y + 0.5) / 9) * 100}%`,
  })

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div
        className="absolute h-[11%] max-h-14 w-[11%] max-w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-md ring-2 ring-red-900/30 transition-all duration-300 ease-in-out"
        style={styleFor(p1.x, p1.y)}
        aria-label="Player 1"
      />
      <div
        className="absolute h-[11%] max-h-14 w-[11%] max-w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 shadow-md ring-2 ring-blue-900/30 transition-all duration-300 ease-in-out"
        style={styleFor(p2.x, p2.y)}
        aria-label="Player 2"
      />
    </div>
  )
}
