import type { BoardArenaId, PlayerKey } from '@/src/types/game'

/**
 * Board presentation moods (shortlist from UX plan):
 * - standard: flat checker tuned for readability
 * - route: soft overworld-style gradients on cells + radial vignette on stage
 * - gym: stronger frame / inset ring so the grid reads as an arena floor
 * - battleNight: deeper dark-mode bases and slightly boosted saturation for long sessions
 */
export type BoardMood = 'standard' | 'route' | 'gym' | 'battleNight'

export type BoardVisualPrefs = {
  highContrast?: boolean
  mood?: BoardMood
}

function normalizePrefs(p?: BoardVisualPrefs): { highContrast: boolean; mood: BoardMood } {
  return {
    highContrast: p?.highContrast ?? false,
    mood: p?.mood ?? 'standard',
  }
}

type TilePair = { light: string; dark: string }

/** Checkerboard tuned for luminance separation (grass vs fire, electric vs ground). */
const TILES: Record<BoardArenaId, TilePair> = {
  water: {
    light: 'bg-sky-100/92 dark:bg-sky-950/55',
    dark: 'bg-sky-300/90 dark:bg-sky-900/48',
  },
  grass: {
    light: 'bg-emerald-100/92 dark:bg-emerald-950/52',
    dark: 'bg-emerald-500/88 dark:bg-emerald-800/48',
  },
  fire: {
    light: 'bg-orange-100/92 dark:bg-orange-950/50',
    dark: 'bg-rose-600/88 dark:bg-orange-900/46',
  },
  air: {
    light: 'bg-violet-100/92 dark:bg-violet-950/50',
    dark: 'bg-violet-500/88 dark:bg-violet-900/45',
  },
  electric: {
    light: 'bg-yellow-50/95 dark:bg-slate-900/58',
    dark: 'bg-amber-300/90 dark:bg-slate-700/50',
  },
  ground: {
    light: 'bg-stone-200/92 dark:bg-amber-950/52',
    dark: 'bg-amber-800/88 dark:bg-stone-700/48',
  },
}

/** High-contrast checker: large luminance steps + type-tint inset ring; valid moves use unified cyan. */
const TILES_HIGH_CONTRAST: Record<BoardArenaId, TilePair> = {
  water: {
    light:
      'bg-sky-50 ring-1 ring-inset ring-sky-500/45 dark:bg-sky-950 dark:ring-sky-400/35',
    dark:
      'bg-sky-200 ring-1 ring-inset ring-sky-600/50 dark:bg-sky-800 dark:ring-sky-300/40',
  },
  grass: {
    light:
      'bg-emerald-50 ring-1 ring-inset ring-emerald-600/40 dark:bg-emerald-950 dark:ring-emerald-400/35',
    dark:
      'bg-emerald-200 ring-1 ring-inset ring-emerald-700/55 dark:bg-emerald-900 dark:ring-emerald-300/40',
  },
  fire: {
    light:
      'bg-orange-50 ring-1 ring-inset ring-orange-600/45 dark:bg-orange-950 dark:ring-orange-400/35',
    dark:
      'bg-orange-200 ring-1 ring-inset ring-orange-700/55 dark:bg-orange-900 dark:ring-orange-300/40',
  },
  air: {
    light:
      'bg-violet-50 ring-1 ring-inset ring-violet-600/45 dark:bg-violet-950 dark:ring-violet-400/35',
    dark:
      'bg-violet-200 ring-1 ring-inset ring-violet-700/55 dark:bg-violet-900 dark:ring-violet-300/40',
  },
  electric: {
    light:
      'bg-yellow-50 ring-1 ring-inset ring-amber-600/50 dark:bg-zinc-900 dark:ring-yellow-300/40',
    dark:
      'bg-amber-200 ring-1 ring-inset ring-amber-800/55 dark:bg-zinc-800 dark:ring-yellow-200/35',
  },
  ground: {
    light:
      'bg-stone-100 ring-1 ring-inset ring-stone-600/45 dark:bg-stone-950 dark:ring-amber-600/30',
    dark:
      'bg-stone-300 ring-1 ring-inset ring-stone-700/55 dark:bg-stone-800 dark:ring-amber-500/35',
  },
}

/** Route mood: diagonal gradients per cell (full literals for Tailwind JIT). */
const TILES_ROUTE: Record<BoardArenaId, TilePair> = {
  water: {
    light:
      'bg-gradient-to-br from-sky-100/95 to-sky-200/90 dark:from-sky-950/60 dark:to-sky-900/50',
    dark:
      'bg-gradient-to-br from-sky-300/95 to-sky-400/88 dark:from-sky-900/55 dark:to-sky-800/48',
  },
  grass: {
    light:
      'bg-gradient-to-br from-emerald-100/95 to-emerald-200/90 dark:from-emerald-950/58 dark:to-emerald-900/50',
    dark:
      'bg-gradient-to-br from-emerald-500/92 to-emerald-600/88 dark:from-emerald-800/52 dark:to-emerald-700/48',
  },
  fire: {
    light:
      'bg-gradient-to-br from-orange-100/95 to-amber-100/90 dark:from-orange-950/55 dark:to-orange-900/48',
    dark:
      'bg-gradient-to-br from-rose-600/92 to-orange-600/88 dark:from-orange-900/50 dark:to-rose-900/46',
  },
  air: {
    light:
      'bg-gradient-to-br from-violet-100/95 to-violet-200/90 dark:from-violet-950/55 dark:to-violet-900/48',
    dark:
      'bg-gradient-to-br from-violet-500/92 to-violet-600/88 dark:from-violet-900/50 dark:to-violet-800/45',
  },
  electric: {
    light:
      'bg-gradient-to-br from-yellow-50/98 to-amber-100/92 dark:from-slate-900/60 dark:to-slate-800/52',
    dark:
      'bg-gradient-to-br from-amber-300/92 to-yellow-200/88 dark:from-slate-700/52 dark:to-slate-600/48',
  },
  ground: {
    light:
      'bg-gradient-to-br from-stone-200/95 to-amber-100/88 dark:from-amber-950/58 dark:to-stone-900/52',
    dark:
      'bg-gradient-to-br from-amber-800/90 to-stone-600/85 dark:from-stone-800/52 dark:to-amber-900/48',
  },
}

const BATTLE_NIGHT_TILE_SUFFIX =
  ' dark:brightness-[0.92] dark:saturate-[1.12]' as const

function pickTiles(arena: BoardArenaId, isLight: boolean, prefs: BoardVisualPrefs | undefined): string {
  const { highContrast, mood } = normalizePrefs(prefs)
  if (highContrast) {
    const pair = TILES_HIGH_CONTRAST[arena]
    return isLight ? pair.light : pair.dark
  }
  let pair: TilePair
  if (mood === 'route') {
    pair = TILES_ROUTE[arena]
  } else {
    pair = TILES[arena]
  }
  const base = isLight ? pair.light : pair.dark
  if (mood === 'battleNight') {
    return `${base}${BATTLE_NIGHT_TILE_SUFFIX}`
  }
  return base
}

/** Move/Fence toolbar chrome. */
const CHROME: Record<BoardArenaId, { shell: string; inactive: string; active: string }> = {
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

const CHROME_GYM_SHELL_SUFFIX =
  ' shadow-md ring-1 ring-black/10 dark:ring-white/10' as const

const FENCE_HOVER: Record<BoardArenaId, string> = {
  water: 'hover:bg-sky-400/15 active:bg-sky-400/25',
  grass: 'hover:bg-emerald-400/15 active:bg-emerald-400/25',
  fire: 'hover:bg-orange-400/15 active:bg-orange-400/25',
  air: 'hover:bg-violet-400/15 active:bg-violet-400/25',
  electric: 'hover:bg-amber-400/15 active:bg-amber-400/25',
  ground: 'hover:bg-amber-600/15 active:bg-amber-600/25',
}

const VALID_DOT: Record<BoardArenaId, string> = {
  water: 'bg-sky-600/55 dark:bg-sky-300/45',
  grass: 'bg-emerald-600/55 dark:bg-emerald-300/45',
  fire: 'bg-orange-600/55 dark:bg-orange-300/45',
  air: 'bg-violet-600/55 dark:bg-violet-300/45',
  electric: 'bg-amber-600/55 dark:bg-amber-300/45',
  ground: 'bg-stone-600/55 dark:bg-stone-300/45',
}

const VALID_RING: Record<BoardArenaId, string> = {
  water: 'ring-sky-500/65',
  grass: 'ring-emerald-500/65',
  fire: 'ring-orange-500/65',
  air: 'ring-violet-500/65',
  electric: 'ring-amber-500/65',
  ground: 'ring-amber-700/60',
}

const VALID_DOT_HIGH_CONTRAST = 'bg-cyan-600 dark:bg-cyan-300' as const
const VALID_RING_HIGH_CONTRAST = 'ring-cyan-500/85 dark:ring-cyan-400/80' as const

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

const PENDING_MOVE_RING_HIGH_CONTRAST =
  'ring-2 ring-amber-500 dark:ring-amber-200' as const

const BOARD_OUTER_RING: Record<BoardArenaId, string> = {
  water: 'ring-sky-900/20 dark:ring-sky-300/15',
  grass: 'ring-emerald-900/20 dark:ring-emerald-400/15',
  fire: 'ring-orange-900/20 dark:ring-orange-300/15',
  air: 'ring-violet-900/20 dark:ring-violet-300/15',
  electric: 'ring-amber-900/20 dark:ring-amber-300/15',
  ground: 'ring-stone-700/25 dark:ring-stone-400/15',
}

const BOARD_OUTER_RING_GYM_SUFFIX = ' ring-2 ring-black/12 dark:ring-white/12' as const

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

/** Deuter-friendly pair: blue vs orange, distinct from grass/fire tile hues in grayscale. */
const FENCE_HC_P1 = 'bg-blue-800 dark:bg-blue-200' as const
const FENCE_HC_P2 = 'bg-orange-700 dark:bg-orange-300' as const

export function getArenaFenceSolidBarClass(
  arena: BoardArenaId,
  placedBy: PlayerKey,
  prefs?: BoardVisualPrefs,
): string {
  if (normalizePrefs(prefs).highContrast) {
    return placedBy === 'player1' ? FENCE_HC_P1 : FENCE_HC_P2
  }
  return placedBy === 'player1' ? FENCE_P1[arena] : FENCE_P2[arena]
}

export function getArenaTileClasses(
  arena: BoardArenaId,
  isLight: boolean,
  prefs?: BoardVisualPrefs,
): string {
  return pickTiles(arena, isLight, prefs)
}

export function getArenaChromeClasses(
  arena: BoardArenaId,
  prefs?: BoardVisualPrefs,
): {
  shell: string
  inactive: string
  active: string
} {
  const c = CHROME[arena]
  const { mood } = normalizePrefs(prefs)
  if (mood === 'gym') {
    return {
      ...c,
      shell: `${c.shell}${CHROME_GYM_SHELL_SUFFIX}`,
    }
  }
  return c
}

export function getArenaFenceHoverClass(arena: BoardArenaId, prefs?: BoardVisualPrefs): string {
  if (normalizePrefs(prefs).highContrast) {
    return 'hover:bg-cyan-400/20 active:bg-cyan-400/30 dark:hover:bg-cyan-300/15 dark:active:bg-cyan-300/25'
  }
  return FENCE_HOVER[arena]
}

export function getArenaValidMoveDotClass(arena: BoardArenaId, prefs?: BoardVisualPrefs): string {
  if (normalizePrefs(prefs).highContrast) {
    return VALID_DOT_HIGH_CONTRAST
  }
  return VALID_DOT[arena]
}

export function getArenaValidRingClass(arena: BoardArenaId, prefs?: BoardVisualPrefs): string {
  if (normalizePrefs(prefs).highContrast) {
    return VALID_RING_HIGH_CONTRAST
  }
  return VALID_RING[arena]
}

export function getArenaPendingRingOffsetClass(arena: BoardArenaId): string {
  return PENDING_OFFSET[arena]
}

export function getArenaPendingMoveRingClasses(arena: BoardArenaId, prefs?: BoardVisualPrefs): string {
  const ring = normalizePrefs(prefs).highContrast ? PENDING_MOVE_RING_HIGH_CONTRAST : PENDING_MOVE_RING
  return `${ring} ring-offset-2 ${PENDING_OFFSET[arena]}`
}

export function getArenaBoardOuterRingClass(arena: BoardArenaId, prefs?: BoardVisualPrefs): string {
  const base = `ring-1 ${BOARD_OUTER_RING[arena]}`
  const { mood } = normalizePrefs(prefs)
  if (mood === 'gym') {
    return `${base}${BOARD_OUTER_RING_GYM_SUFFIX}`
  }
  return base
}

/**
 * Backdrop behind the tile grid: route vignette, gym inset depth, night crush (dark).
 * Apply on a layer under the grid (`absolute inset-0`, non-interactive).
 */
export function getArenaBoardBackdropClass(_arena: BoardArenaId, prefs?: BoardVisualPrefs): string {
  const { mood, highContrast } = normalizePrefs(prefs)
  if (highContrast) {
    return 'bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.04)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.35)_100%)]'
  }
  if (mood === 'route') {
    return 'bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0)_42%,rgba(148,163,184,0.12)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(0,0,0,0.5)_100%)]'
  }
  if (mood === 'gym') {
    return 'shadow-[inset_0_0_24px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_0_28px_rgba(0,0,0,0.35)]'
  }
  if (mood === 'battleNight') {
    return 'dark:bg-[radial-gradient(ellipse_at_center,transparent_52%,rgba(0,0,0,0.42)_100%)]'
  }
  return ''
}

export function getArenaFenceGhostBarClass(
  arena: BoardArenaId,
  placedBy: PlayerKey,
  prefs?: BoardVisualPrefs,
): string {
  const solid = getArenaFenceSolidBarClass(arena, placedBy, prefs)
  const outline = normalizePrefs(prefs).highContrast
    ? 'outline outline-2 outline-dashed outline-black/50 dark:outline-white/45'
    : 'outline outline-2 outline-dashed outline-black/30 dark:outline-white/20'
  return `${solid} opacity-50 ${outline}`
}
