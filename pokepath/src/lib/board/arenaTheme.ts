import type { BoardArenaId, PlayerKey } from '@/src/types/game'

const GRASS_ARENA: BoardArenaId = 'grass'

export function getArenaTileTextureUrl(_arena: BoardArenaId): string {
  return '/board-tiles/grass-arena-texture.png'
}

/** Background image layer (caller sets `style={{ backgroundImage }}`). */
export function getArenaTileTextureLayerClasses(isLight: boolean): string {
  return [
    'pointer-events-none absolute inset-0 z-0 bg-cover bg-center',
    isLight ? 'brightness-105' : 'brightness-95',
  ].join(' ')
}

/** Checkerboard shade on top of the shared arena texture. */
export function getArenaTileShadeLayerClasses(isLight: boolean): string {
  const base = 'pointer-events-none absolute inset-0 z-[1]'
  return isLight
    ? `${base} bg-transparent dark:bg-black/15`
    : `${base} bg-black/25 dark:bg-black/40`
}

/** Move/Fence toolbar chrome. */
const CHROME = {
  shell: 'border-emerald-800/30 bg-emerald-50/80 dark:border-emerald-700/40 dark:bg-emerald-950/40',
  inactive: 'text-emerald-800/80 dark:text-emerald-200/70',
  active: 'bg-white text-emerald-950 shadow dark:bg-emerald-900 dark:text-emerald-50',
} as const

const FENCE_HOVER = 'hover:bg-emerald-400/15 active:bg-emerald-400/25'

const VALID_DOT = 'bg-emerald-600/50 dark:bg-emerald-300/40'

const VALID_RING = 'ring-emerald-500/60'

const PENDING_OFFSET = 'ring-offset-emerald-100 dark:ring-offset-emerald-950'

/** Strong ring for pending move target (readable on all tile hues). */
const PENDING_MOVE_RING =
  'ring-2 ring-amber-400/95 dark:ring-amber-300/85' as const

const BOARD_OUTER_RING = 'ring-emerald-900/20 dark:ring-emerald-400/15'

/** Chalk-line colour for the soccer-field overlay (consumed via `currentColor`). */
const FIELD_LINE = 'text-emerald-900/70 dark:text-emerald-200/55'

/** Fence bars: neutral per arena; ownership is conveyed by glow/tint helpers. */
const FENCE_P1 = 'bg-amber-100/95 dark:bg-amber-200/90'

const FENCE_P2 = 'bg-amber-100/95 dark:bg-amber-200/90'

const FENCE_OWNER_GLOW: Record<PlayerKey, string> = {
  player1: 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]',
  player2: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]',
}

const FENCE_OWNER_TINT: Record<PlayerKey, string> = {
  player1: 'ring-1 ring-red-400/65 dark:ring-red-300/70',
  player2: 'ring-1 ring-blue-400/65 dark:ring-blue-300/70',
}

const FENCE_GHOST_TINT: Record<PlayerKey, string> = {
  player1: 'bg-red-200/80 dark:bg-red-200/70',
  player2: 'bg-blue-200/80 dark:bg-blue-200/70',
}

export function getArenaFenceSolidBarClass(arena: BoardArenaId, placedBy: PlayerKey): string {
  void arena
  return placedBy === 'player1' ? FENCE_P1 : FENCE_P2
}

/** High-contrast styling to prevent fences blending into textured grids. */
export function getArenaFenceContrastClass(): string {
  return 'outline outline-2 -outline-offset-1 outline-black/90 dark:outline-white/85 shadow-[0_0_0_1px_rgba(255,255,255,0.68),0_2px_4px_rgba(0,0,0,0.62)]'
}

export function getArenaFenceOwnerGlowClass(placedBy: PlayerKey): string {
  return FENCE_OWNER_GLOW[placedBy]
}

export function getArenaFenceOwnerTintClass(placedBy: PlayerKey): string {
  return FENCE_OWNER_TINT[placedBy]
}

export function getArenaChromeClasses(arena: BoardArenaId): {
  shell: string
  inactive: string
  active: string
} {
  void arena
  return CHROME
}

export function getArenaFenceHoverClass(arena: BoardArenaId): string {
  void arena
  return FENCE_HOVER
}

export function getArenaValidMoveDotClass(arena: BoardArenaId): string {
  void arena
  return VALID_DOT
}

export function getArenaValidRingClass(arena: BoardArenaId): string {
  void arena
  return VALID_RING
}

export function getArenaPendingRingOffsetClass(arena: BoardArenaId): string {
  void arena
  return PENDING_OFFSET
}

export function getArenaPendingMoveRingClasses(arena: BoardArenaId): string {
  void arena
  return `${PENDING_MOVE_RING} ring-offset-2 ${PENDING_OFFSET}`
}

export function getArenaBoardOuterRingClass(arena: BoardArenaId): string {
  void arena
  return `ring-1 ${BOARD_OUTER_RING}`
}

export function getArenaFieldLineClass(arena: BoardArenaId): string {
  void arena
  return FIELD_LINE
}

export function getArenaFenceGhostBarClass(arena: BoardArenaId, placedBy: PlayerKey): string {
  return [
    getArenaFenceSolidBarClass(arena, placedBy),
    getArenaFenceContrastClass(),
    getArenaFenceOwnerGlowClass(placedBy),
    getArenaFenceOwnerTintClass(placedBy),
    FENCE_GHOST_TINT[placedBy],
    'opacity-50 outline-dashed animate-pulse',
  ].join(' ')
}
