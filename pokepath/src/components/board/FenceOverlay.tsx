'use client'

import { getArenaFenceGhostBarClass, getArenaFenceSolidBarClass } from '@/src/lib/board/arenaTheme'
import type { BoardArenaId, Fence, FenceOrientation, PlayerKey } from '@/src/types/game'

type FenceOverlayProps = {
  arena: BoardArenaId
  fences: Fence[]
  pendingFence: { x: number; y: number; orientation: FenceOrientation } | null
  pendingPlacedBy: PlayerKey | null
  hoverFence: { x: number; y: number; orientation: FenceOrientation } | null
}

function GhostBar({
  arena,
  x,
  y,
  orientation,
  placedBy,
}: {
  arena: BoardArenaId
  x: number
  y: number
  orientation: FenceOrientation
  placedBy: PlayerKey
}) {
  const cls = getArenaFenceGhostBarClass(arena, placedBy)
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
  arena,
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
            className={`absolute h-1 ${getArenaFenceSolidBarClass(arena, f.placedBy)}`}
            style={{
              left: `${(f.x / 9) * 100}%`,
              top: `calc(${(f.y + 1) / 9 * 100}% - 2px)`,
              width: `${(2 / 9) * 100}%`,
            }}
          />
        ) : (
          <div
            key={f.id}
            className={`absolute w-1 ${getArenaFenceSolidBarClass(arena, f.placedBy)}`}
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
          arena={arena}
          x={pendingFence.x}
          y={pendingFence.y}
          orientation={pendingFence.orientation}
          placedBy={pendingPlacedBy}
        />
      )}
      {hoverFence && pendingPlacedBy && showHover && (
        <GhostBar
          arena={arena}
          x={hoverFence.x}
          y={hoverFence.y}
          orientation={hoverFence.orientation}
          placedBy={pendingPlacedBy}
        />
      )}
    </div>
  )
}
