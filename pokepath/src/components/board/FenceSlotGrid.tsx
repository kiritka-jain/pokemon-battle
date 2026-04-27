'use client'

import type { ReactNode } from 'react'

import { getArenaFenceHoverClass } from '@/src/lib/board/arenaTheme'
import type { BoardArenaId, FenceOrientation } from '@/src/types/game'

type FenceSlotGridProps = {
  arena: BoardArenaId
  orientation: FenceOrientation
  visible: boolean
  getSlotValidity?: (x: number, y: number, orientation: FenceOrientation) => boolean
  onHover: (slot: { x: number; y: number; orientation: FenceOrientation } | null) => void
  onPick: (x: number, y: number, orientation: FenceOrientation) => void
}

/**
 * Click targets for fence anchors (0–7, 0–7). Only one orientation is shown at a time
 * so horizontal and vertical slots never overlap.
 */
export function FenceSlotGrid({
  arena,
  orientation,
  visible,
  getSlotValidity,
  onHover,
  onPick,
}: FenceSlotGridProps) {
  if (!visible) return null

  const slots: ReactNode[] = []
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const isLegal = getSlotValidity?.(x, y, orientation) ?? true
      const hoverCls = isLegal
        ? `border-0 bg-transparent ${getArenaFenceHoverClass(arena)}`
        : 'border-0 bg-transparent hover:bg-rose-500/25 focus-visible:bg-rose-500/25'

      if (orientation === 'H') {
        slots.push(
          <button
            key={`h-${x}-${y}`}
            type="button"
            aria-label={`${isLegal ? 'Legal' : 'Illegal'} fence slot horizontal ${x} ${y}`}
            className={`absolute z-[25] min-h-[44px] cursor-pointer ${hoverCls}`}
            style={{
              left: `${(x / 9) * 100}%`,
              top: `calc(${(y + 1) / 9 * 100}% - 22px)`,
              width: `${(2 / 9) * 100}%`,
              height: '44px',
            }}
            onMouseEnter={() => onHover({ x, y, orientation: 'H' })}
            onFocus={() => onHover({ x, y, orientation: 'H' })}
            onMouseLeave={() => onHover(null)}
            onBlur={() => onHover(null)}
            onClick={() => onPick(x, y, 'H')}
          />
        )
      } else {
        slots.push(
          <button
            key={`v-${x}-${y}`}
            type="button"
            aria-label={`${isLegal ? 'Legal' : 'Illegal'} fence slot vertical ${x} ${y}`}
            className={`absolute z-[25] min-w-[44px] cursor-pointer ${hoverCls}`}
            style={{
              left: `calc(${(x + 1) / 9 * 100}% - 22px)`,
              top: `${(y / 9) * 100}%`,
              width: '44px',
              height: `${(2 / 9) * 100}%`,
            }}
            onMouseEnter={() => onHover({ x, y, orientation: 'V' })}
            onFocus={() => onHover({ x, y, orientation: 'V' })}
            onMouseLeave={() => onHover(null)}
            onBlur={() => onHover(null)}
            onClick={() => onPick(x, y, 'V')}
          />
        )
      }
    }
  }

  return <div className="pointer-events-auto absolute inset-0">{slots}</div>
}
