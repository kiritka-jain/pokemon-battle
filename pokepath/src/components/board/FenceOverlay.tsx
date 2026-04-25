'use client'

import {
  getArenaFenceContrastClass,
  getArenaFenceGhostBarClass,
  getArenaFenceOwnerGlowClass,
  getArenaFenceOwnerTintClass,
  getArenaFenceSolidBarClass,
} from '@/src/lib/board/arenaTheme'
import type { BoardArenaId, Fence, FenceOrientation, PlayerKey } from '@/src/types/game'

type FenceOverlayProps = {
  arena: BoardArenaId
  fences: Fence[]
  pendingFence: { x: number; y: number; orientation: FenceOrientation } | null
  pendingPlacedBy: PlayerKey | null
  hoverFence: { x: number; y: number; orientation: FenceOrientation } | null
}

function FenceBar({
  arena,
  x,
  y,
  orientation,
  placedBy,
  isGhost = false,
}: {
  arena: BoardArenaId
  x: number
  y: number
  orientation: FenceOrientation
  placedBy: PlayerKey
  isGhost?: boolean
}) {
  const cls = isGhost
    ? getArenaFenceGhostBarClass(arena, placedBy)
    : [
        getArenaFenceSolidBarClass(arena, placedBy),
        getArenaFenceContrastClass(),
        getArenaFenceOwnerGlowClass(placedBy),
        getArenaFenceOwnerTintClass(placedBy),
      ].join(' ')

  if (orientation === 'H') {
    return (
      <div
        className={`absolute h-1 rounded-[2px] ${cls}`}
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
      className={`absolute w-1 rounded-[2px] ${cls}`}
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
      {fences.map((f) => (
        <FenceBar
          key={f.id}
          arena={arena}
          x={f.x}
          y={f.y}
          orientation={f.orientation}
          placedBy={f.placedBy}
        />
      ))}
      {pendingFence && pendingPlacedBy && (
        <FenceBar
          arena={arena}
          x={pendingFence.x}
          y={pendingFence.y}
          orientation={pendingFence.orientation}
          placedBy={pendingPlacedBy}
          isGhost
        />
      )}
      {hoverFence && pendingPlacedBy && showHover && (
        <FenceBar
          arena={arena}
          x={hoverFence.x}
          y={hoverFence.y}
          orientation={hoverFence.orientation}
          placedBy={pendingPlacedBy}
          isGhost
        />
      )}
    </div>
  )
}
