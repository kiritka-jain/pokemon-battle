'use client'

import { getArenaFieldLineClass } from '@/src/lib/board/arenaTheme'
import type { BoardArenaId } from '@/src/types/game'

type ArenaFieldOverlayProps = {
  arena: BoardArenaId
}

/**
 * Decorative soccer-field markings (chalk lines + a static poké-ball at the
 * centre spot) drawn on top of the 9x9 arena tile grid.
 *
 * The viewBox is 90x90 so 1 tile = 10 svg-units, which keeps the maths obvious
 * relative to engine coordinates: tile (x, y) centres on `((x+0.5)*10, (y+0.5)*10)`.
 *
 * Layer notes:
 *  - `pointer-events-none` and `aria-hidden` so the overlay never intercepts
 *    clicks or screen-reader output.
 *  - z-index sits above the tile grid (z-0) but below `FenceOverlay` (z-15)
 *    and `PlayerSprites` (z-20) so gameplay elements always win visually.
 */
export function ArenaFieldOverlay({ arena }: ArenaFieldOverlayProps) {
  const lineClass = getArenaFieldLineClass(arena)

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
      viewBox="0 0 90 90"
      preserveAspectRatio="none"
      aria-hidden
      focusable={false}
    >
      <g
        className={`${lineClass} opacity-70 mix-blend-multiply dark:opacity-55 dark:mix-blend-screen`}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      >
        <rect x={0.4} y={0.4} width={89.2} height={89.2} strokeWidth={1.4} />

        <line x1={0.4} y1={45} x2={89.6} y2={45} />
      </g>

      <g
        transform="translate(45 45)"
        stroke="rgba(0,0,0,0.78)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      >
        <path d="M -10 0 A 10 10 0 0 0 10 0 Z" fill="rgba(239,68,68,0.72)" />
        <path d="M -10 0 A 10 10 0 0 1 10 0 Z" fill="rgba(255,255,255,0.78)" />
        <rect x={-10} y={-0.9} width={20} height={1.8} fill="rgba(0,0,0,0.8)" stroke="none" />
        <circle r={3} fill="rgba(0,0,0,0.8)" stroke="none" />
        <circle r={1.6} fill="rgba(255,255,255,0.94)" stroke="none" />
      </g>
    </svg>
  )
}
