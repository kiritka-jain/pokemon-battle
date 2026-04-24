import type { BoardArenaId, PlayerKey } from '@/src/types/game'

/** Static PNG per arena under `public/board-tiles/`. */
const ARENA_TEXTURE_BASENAME: Record<BoardArenaId, string> = {
  water: 'water',
  grass: 'grass',
  fire: 'fire',
  air: 'air',
  electric: 'electric',
  ground: 'ground',
}

export function getArenaTileTextureUrl(arena: BoardArenaId): string {
  return `/board-tiles/${ARENA_TEXTURE_BASENAME[arena]}.png`
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
const CHROME: Record<
  BoardArenaId,
  { shell: string; inactive: string; active: string }
> = {
  water: {
    shell: 'border-sky-800/30 bg-sky-50/80 dark:border-sky-700/40 dark:bg-sky-950/40',
    inactive: 'text-sky-800/80 dark:text-sky-200/70',
    active: 'bg-white text-sky-950 shadow dark:bg-sky-900 dark:text-sky-50',
  },
  grass: {
    shell: 'border-emerald-800/30 bg-emerald-50/80 dark:border-emerald-700/40 dark:bg-emerald-950/40',
    inactive: 'text-emerald-800/80 dark:text-emerald-200/70',
    active: 'bg-white text-emerald-950 shadow dark:bg-emerald-900 dark:text-emerald-50',
  },
  fire: {
    shell: 'border-orange-800/30 bg-orange-50/80 dark:border-orange-800/40 dark:bg-orange-950/35',
    inactive: 'text-orange-900/80 dark:text-orange-200/70',
    active: 'bg-white text-orange-950 shadow dark:bg-orange-900 dark:text-orange-50',
  },
  air: {
    shell: 'border-violet-800/30 bg-violet-50/80 dark:border-violet-700/40 dark:bg-violet-950/35',
    inactive: 'text-violet-900/80 dark:text-violet-200/70',
    active: 'bg-white text-violet-950 shadow dark:bg-violet-900 dark:text-violet-50',
  },
  electric: {
    shell: 'border-amber-800/30 bg-yellow-50/80 dark:border-amber-800/40 dark:bg-amber-950/35',
    inactive: 'text-amber-900/80 dark:text-amber-200/70',
    active: 'bg-white text-amber-950 shadow dark:bg-amber-900 dark:text-amber-50',
  },
  ground: {
    shell: 'border-stone-700/35 bg-stone-100/90 dark:border-stone-600/40 dark:bg-stone-900/45',
    inactive: 'text-stone-800/80 dark:text-stone-200/70',
    active: 'bg-white text-stone-950 shadow dark:bg-stone-800 dark:text-stone-50',
  },
}

const FENCE_HOVER: Record<BoardArenaId, string> = {
  water: 'hover:bg-sky-400/15 active:bg-sky-400/25',
  grass: 'hover:bg-emerald-400/15 active:bg-emerald-400/25',
  fire: 'hover:bg-orange-400/15 active:bg-orange-400/25',
  air: 'hover:bg-violet-400/15 active:bg-violet-400/25',
  electric: 'hover:bg-amber-400/15 active:bg-amber-400/25',
  ground: 'hover:bg-amber-600/15 active:bg-amber-600/25',
}

const VALID_DOT: Record<BoardArenaId, string> = {
  water: 'bg-sky-600/50 dark:bg-sky-300/40',
  grass: 'bg-emerald-600/50 dark:bg-emerald-300/40',
  fire: 'bg-orange-600/50 dark:bg-orange-300/40',
  air: 'bg-violet-600/50 dark:bg-violet-300/40',
  electric: 'bg-amber-600/50 dark:bg-amber-300/40',
  ground: 'bg-stone-600/50 dark:bg-stone-300/40',
}

const VALID_RING: Record<BoardArenaId, string> = {
  water: 'ring-sky-500/60',
  grass: 'ring-emerald-500/60',
  fire: 'ring-orange-500/60',
  air: 'ring-violet-500/60',
  electric: 'ring-amber-500/60',
  ground: 'ring-amber-700/55',
}

const PENDING_OFFSET: Record<BoardArenaId, string> = {
  water: 'ring-offset-sky-100 dark:ring-offset-sky-950',
  grass: 'ring-offset-emerald-100 dark:ring-offset-emerald-950',
  fire: 'ring-offset-orange-100 dark:ring-offset-orange-950',
  air: 'ring-offset-violet-100 dark:ring-offset-violet-950',
  electric: 'ring-offset-yellow-100 dark:ring-offset-amber-950',
  ground: 'ring-offset-amber-100 dark:ring-offset-stone-900',
}

/** Strong ring for pending move target (readable on all tile hues). */
const PENDING_MOVE_RING =
  'ring-2 ring-amber-400/95 dark:ring-amber-300/85' as const

const BOARD_OUTER_RING: Record<BoardArenaId, string> = {
  water: 'ring-sky-900/20 dark:ring-sky-300/15',
  grass: 'ring-emerald-900/20 dark:ring-emerald-400/15',
  fire: 'ring-orange-900/20 dark:ring-orange-300/15',
  air: 'ring-violet-900/20 dark:ring-violet-300/15',
  electric: 'ring-amber-900/20 dark:ring-amber-300/15',
  ground: 'ring-stone-700/25 dark:ring-stone-400/15',
}

/** Fence bars: keep p1/p2 contrast, tint per arena. */
const FENCE_P1: Record<BoardArenaId, string> = {
  water: 'bg-sky-900',
  grass: 'bg-amber-900',
  fire: 'bg-red-900',
  air: 'bg-violet-900',
  electric: 'bg-amber-900',
  ground: 'bg-stone-800',
}

const FENCE_P2: Record<BoardArenaId, string> = {
  water: 'bg-sky-700',
  grass: 'bg-amber-700',
  fire: 'bg-orange-800',
  air: 'bg-violet-700',
  electric: 'bg-yellow-800',
  ground: 'bg-amber-800',
}

export function getArenaFenceSolidBarClass(arena: BoardArenaId, placedBy: PlayerKey): string {
  return placedBy === 'player1' ? FENCE_P1[arena] : FENCE_P2[arena]
}

export function getArenaChromeClasses(arena: BoardArenaId): {
  shell: string
  inactive: string
  active: string
} {
  return CHROME[arena]
}

export function getArenaFenceHoverClass(arena: BoardArenaId): string {
  return FENCE_HOVER[arena]
}

export function getArenaValidMoveDotClass(arena: BoardArenaId): string {
  return VALID_DOT[arena]
}

export function getArenaValidRingClass(arena: BoardArenaId): string {
  return VALID_RING[arena]
}

export function getArenaPendingRingOffsetClass(arena: BoardArenaId): string {
  return PENDING_OFFSET[arena]
}

export function getArenaPendingMoveRingClasses(arena: BoardArenaId): string {
  return `${PENDING_MOVE_RING} ring-offset-2 ${PENDING_OFFSET[arena]}`
}

export function getArenaBoardOuterRingClass(arena: BoardArenaId): string {
  return `ring-1 ${BOARD_OUTER_RING[arena]}`
}

export function getArenaFenceGhostBarClass(arena: BoardArenaId, placedBy: PlayerKey): string {
  return `${getArenaFenceSolidBarClass(arena, placedBy)} opacity-50 outline outline-2 outline-dashed outline-black/30 dark:outline-white/20`
}
