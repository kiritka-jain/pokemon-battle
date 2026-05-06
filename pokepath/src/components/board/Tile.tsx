'use client'

import {
  getArenaPendingMoveRingClasses,
  getArenaTileShadeLayerClasses,
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
  const isTileInteractive = canInteract && interactionMode === 'move'

  const validHint =
    interactionMode === 'move' && canInteract && isValidMoveDestination
      ? `ring-2 ${getArenaValidRingClass(arena)}`
      : ''

  const pending =
    isPendingMoveTarget && interactionMode === 'move'
      ? getArenaPendingMoveRingClasses(arena)
      : ''

  const handleClick = () => {
    if (!isTileInteractive) return
    onSelectMove(x, y)
  }

  const col = x + 1
  const row = y + 1
  const ariaLabel =
    isTileInteractive
      ? `Move to column ${col}, row ${row}`
      : `Board square column ${col}, row ${row}`

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-disabled={!isTileInteractive}
      tabIndex={isTileInteractive ? 0 : -1}
      onClick={handleClick}
      className={[
        'relative m-0 flex min-h-0 min-w-0 appearance-none items-center justify-center overflow-hidden border-0 bg-transparent p-0',
        validHint,
        pending,
        isTileInteractive
          ? 'cursor-pointer hover:brightness-95'
          : 'cursor-default',
      ].join(' ')}
    >
      <span className={getArenaTileShadeLayerClasses(isLight)} aria-hidden />
      {isValidMoveDestination && interactionMode === 'move' && canInteract && (
        <span
          className={`pointer-events-none relative z-10 m-auto h-3 w-3 rounded-full ${getArenaValidMoveDotClass(arena)}`}
          aria-hidden
        />
      )}
    </button>
  )
}
