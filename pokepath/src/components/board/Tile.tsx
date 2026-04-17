'use client'

export type BoardInteractionMode = 'move' | 'fence'

type TileProps = {
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
  x,
  y,
  isLight,
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
          className="pointer-events-none absolute inset-0 m-auto h-2 w-2 rounded-full bg-emerald-600/50 dark:bg-emerald-300/40"
          aria-hidden
        />
      )}
    </button>
  )
}
