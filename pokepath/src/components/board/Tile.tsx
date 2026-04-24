'use client'

import { useMemo } from 'react'

import {
  getArenaPendingMoveRingClasses,
  getArenaTileClasses,
  getArenaValidMoveDotClass,
  getArenaValidRingClass,
  type BoardVisualPrefs,
} from '@/src/lib/board/arenaTheme'
import { useBoardVisualPrefsStore } from '@/src/lib/store/boardVisualPrefsStore'
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
  const highContrastBoard = useBoardVisualPrefsStore((s) => s.highContrastBoard)
  const boardMood = useBoardVisualPrefsStore((s) => s.boardMood)
  const boardPrefs: BoardVisualPrefs = useMemo(
    () => ({ highContrast: highContrastBoard, mood: boardMood }),
    [highContrastBoard, boardMood],
  )

  const base = getArenaTileClasses(arena, isLight, boardPrefs)

  const validHint =
    interactionMode === 'move' && canInteract && isValidMoveDestination
      ? `ring-1 ${getArenaValidRingClass(arena, boardPrefs)}`
      : ''

  const pending =
    isPendingMoveTarget && interactionMode === 'move'
      ? getArenaPendingMoveRingClasses(arena, boardPrefs)
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
          className={`pointer-events-none absolute inset-0 m-auto h-2 w-2 rounded-full ${getArenaValidMoveDotClass(arena, boardPrefs)}`}
          aria-hidden
        />
      )}
    </button>
  )
}
