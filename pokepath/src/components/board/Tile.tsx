'use client'

import {
  getArenaPendingMoveRingClasses,
  getArenaTileClasses,
  getArenaValidMoveDotClass,
  getArenaValidRingClass,
} from '@/src/lib/board/arenaTheme'
import type { BoardArenaId } from '@/src/types/game'

export type BoardInteractionMode = 'move' | 'fence'

type TileProps = {
  arena: BoardArenaId
  x: number
  y: number
  isLight: boolean
  interactionMode: BoardInteractionMode
  /** Highlight when this square is the pending move target */
  isPendingMoveTarget: boolean
  /** Subtle hint when this is a legal destination for the current player */
  isValidMoveDestination: boolean
  canInteract: boolean
  onSelectMove: (x: number, y: number) => void
}

export function Tile({
  arena,
  x,
  y,
  isLight,
  interactionMode,
  isPendingMoveTarget,
  isValidMoveDestination,
  canInteract,
  onSelectMove,
}: TileProps) {
  const base = getArenaTileClasses(arena, isLight)

  const validHint =
    interactionMode === 'move' && canInteract && isValidMoveDestination
      ? `ring-1 ${getArenaValidRingClass(arena)}`
      : ''

  const pending =
    isPendingMoveTarget && interactionMode === 'move'
      ? getArenaPendingMoveRingClasses(arena)
      : ''

  const handleClick = () => {
    if (!canInteract || interactionMode !== 'move') return
    onSelectMove(x, y)
  }

  const col = x + 1
  const row = y + 1
  const ariaLabel =
    canInteract && interactionMode === 'move'
      ? `Move to column ${col}, row ${row}`
      : `Board square column ${col}, row ${row}`

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={handleClick}
      disabled={!canInteract || interactionMode !== 'move'}
      className={[
        'relative flex items-center justify-center',
        base,
        validHint,
        pending,
        canInteract && interactionMode === 'move'
          ? 'cursor-pointer hover:brightness-95'
          : 'cursor-default',
      ].join(' ')}
    >
      {isValidMoveDestination && interactionMode === 'move' && canInteract && (
        <span
          className={`pointer-events-none absolute inset-0 m-auto h-2 w-2 rounded-full ${getArenaValidMoveDotClass(arena)}`}
          aria-hidden
        />
      )}
    </button>
  )
}
