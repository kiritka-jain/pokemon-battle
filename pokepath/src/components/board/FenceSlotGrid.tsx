'use client'

import type { ReactNode } from 'react'

import type { FenceOrientation } from '@/src/types/game'

type FenceSlotGridProps = {
  orientation: FenceOrientation
  visible: boolean
  onHover: (slot: { x: number; y: number; orientation: FenceOrientation } | null) => void
  onPick: (x: number, y: number, orientation: FenceOrientation) => void
}

/**
 * Click targets for fence anchors (0–7, 0–7). Only one orientation is shown at a time
 * so horizontal and vertical slots never overlap.
 */
export function FenceSlotGrid({ orientation, visible, onHover, onPick }: FenceSlotGridProps) {
  if (!visible) return null

  const slots: ReactNode[] = []
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (orientation === 'H') {
        slots.push(
          <button
            key={`h-${x}-${y}`}
            type="button"
            aria-label={`Fence slot horizontal ${x} ${y}`}
            className="absolute z-[25] min-h-[44px] cursor-pointer border-0 bg-transparent hover:bg-emerald-400/15 active:bg-emerald-400/25"
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
            aria-label={`Fence slot vertical ${x} ${y}`}
            className="absolute z-[25] min-w-[44px] cursor-pointer border-0 bg-transparent hover:bg-emerald-400/15 active:bg-emerald-400/25"
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
