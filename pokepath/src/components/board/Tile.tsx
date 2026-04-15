'use client'

export type BoardInteractionMode = 'move' | 'fence'

type TileProps = {
  x: number
  y: number
  isLight: boolean
  showLabels: boolean
  interactionMode: BoardInteractionMode
  /** Highlight when this square is the pending move target */
  isPendingMoveTarget: boolean
  /** Subtle hint when this is a legal destination for the current player */
  isValidMoveDestination: boolean
  canInteract: boolean
  onSelectMove: (x: number, y: number) => void
}

export function Tile({
  x,
  y,
  isLight,
  showLabels,
  interactionMode,
  isPendingMoveTarget,
  isValidMoveDestination,
  canInteract,
  onSelectMove,
}: TileProps) {
  const base =
    isLight
      ? 'bg-emerald-200/90 dark:bg-emerald-900/50'
      : 'bg-emerald-300/90 dark:bg-emerald-950/50'

  const validHint =
    interactionMode === 'move' && canInteract && isValidMoveDestination
      ? 'ring-1 ring-emerald-500/60'
      : ''

  const pending =
    isPendingMoveTarget && interactionMode === 'move'
      ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-emerald-100 dark:ring-offset-emerald-950'
      : ''

  const handleClick = () => {
    if (!canInteract || interactionMode !== 'move') return
    onSelectMove(x, y)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!canInteract || interactionMode !== 'move'}
      className={[
        'relative flex items-center justify-center text-[10px] font-mono text-emerald-950/40 dark:text-emerald-100/30',
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
          className="pointer-events-none absolute inset-0 m-auto h-2 w-2 rounded-full bg-emerald-600/50 dark:bg-emerald-300/40"
          aria-hidden
        />
      )}
      {showLabels && (
        <span className="z-[1]">
          {x},{y}
        </span>
      )}
    </button>
  )
}
