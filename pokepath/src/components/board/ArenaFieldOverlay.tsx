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
      className={`pointer-events-none absolute inset-0 z-[5] h-full w-full opacity-70 mix-blend-multiply dark:opacity-55 dark:mix-blend-screen ${lineClass}`}
      viewBox="0 0 90 90"
      preserveAspectRatio="none"
      aria-hidden
      focusable={false}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={0.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      >
        <rect x={1.5} y={1.5} width={87} height={87} rx={1} ry={1} />

        <line x1={1.5} y1={45} x2={88.5} y2={45} />

        <circle cx={45} cy={45} r={10} />

        <rect x={30} y={1.5} width={30} height={10} />
        <rect x={30} y={78.5} width={30} height={10} />

        <path d="M 36 11.5 A 9 9 0 0 1 54 11.5" />
        <path d="M 36 78.5 A 9 9 0 0 0 54 78.5" />

        <circle cx={45} cy={45} r={3} />
        <line x1={42} y1={45} x2={48} y2={45} />
        <circle cx={45} cy={45} r={0.6} fill="currentColor" stroke="none" />
      </g>
    </svg>
  )
}
