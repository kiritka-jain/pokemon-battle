'use client'

import type { Fence, FenceOrientation, PlayerKey } from '@/src/types/game'

type FenceOverlayProps = {
  fences: Fence[]
  pendingFence: { x: number; y: number; orientation: FenceOrientation } | null
  pendingPlacedBy: PlayerKey | null
  hoverFence: { x: number; y: number; orientation: FenceOrientation } | null
}

function placedClass(placedBy: PlayerKey): string {
  return placedBy === 'player1' ? 'bg-amber-900' : 'bg-amber-700'
}

function GhostBar({
  x,
  y,
  orientation,
  placedBy,
}: {
  x: number
  y: number
  orientation: FenceOrientation
  placedBy: PlayerKey
}) {
  const cls = `${placedClass(placedBy)} opacity-50 outline outline-2 outline-dashed outline-amber-950/50`
  if (orientation === 'H') {
    return (
      <div
        className={`absolute h-1 ${cls}`}
        style={{
          left: `${(x / 9) * 100}%`,
          top: `calc(${(y + 1) / 9 * 100}% - 2px)`,
          width: `${(2 / 9) * 100}%`,
        }}
      />
    )
  }
  return (
    <div
      className={`absolute w-1 ${cls}`}
      style={{
        left: `calc(${(x + 1) / 9 * 100}% - 2px)`,
        top: `${(y / 9) * 100}%`,
        height: `${(2 / 9) * 100}%`,
      }}
    />
  )
}

export function FenceOverlay({
  fences,
  pendingFence,
  pendingPlacedBy,
  hoverFence,
}: FenceOverlayProps) {
  const showHover =
    Boolean(hoverFence && pendingPlacedBy) &&
    (!pendingFence ||
      hoverFence!.x !== pendingFence.x ||
      hoverFence!.y !== pendingFence.y ||
      hoverFence!.orientation !== pendingFence.orientation)

  return (
    <div className="pointer-events-none absolute inset-0 z-[15]" aria-hidden>
      {fences.map((f) =>
        f.orientation === 'H' ? (
          <div
            key={f.id}
            className={`absolute h-1 ${placedClass(f.placedBy)}`}
            style={{
              left: `${(f.x / 9) * 100}%`,
              top: `calc(${(f.y + 1) / 9 * 100}% - 2px)`,
              width: `${(2 / 9) * 100}%`,
            }}
          />
        ) : (
          <div
            key={f.id}
            className={`absolute w-1 ${placedClass(f.placedBy)}`}
            style={{
              left: `calc(${(f.x + 1) / 9 * 100}% - 2px)`,
              top: `${(f.y / 9) * 100}%`,
              height: `${(2 / 9) * 100}%`,
            }}
          />
        )
      )}
      {pendingFence && pendingPlacedBy && (
        <GhostBar
          x={pendingFence.x}
          y={pendingFence.y}
          orientation={pendingFence.orientation}
          placedBy={pendingPlacedBy}
        />
      )}
      {hoverFence && pendingPlacedBy && showHover && (
        <GhostBar
          x={hoverFence.x}
          y={hoverFence.y}
          orientation={hoverFence.orientation}
          placedBy={pendingPlacedBy}
        />
      )}
    </div>
  )
}
