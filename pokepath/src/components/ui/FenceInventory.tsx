'use client'

import { displayNameForSeat } from '@/src/lib/playerDisplayName'
import { useGameStore } from '@/src/lib/store/gameStore'
import { STARTING_FENCES, type PlayerKey } from '@/src/types/game'

type FenceInventoryProps = {
  playerKey: PlayerKey
}

export function FenceInventory({ playerKey }: FenceInventoryProps) {
  const player = useGameStore((s) => s.players[playerKey])
  const fencesLeft = player.fencesLeft
  const displayName = displayNameForSeat({ username: player.username, userId: player.id })
  const accent =
    playerKey === 'player1'
      ? 'bg-red-500 dark:bg-red-400'
      : 'bg-blue-600 dark:bg-blue-400'
  const used = 'bg-zinc-300 opacity-60 dark:bg-zinc-600 dark:opacity-50'

  return (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={`${displayName} fences: ${fencesLeft} remaining`}
    >
      {Array.from({ length: STARTING_FENCES }, (_, i) => (
        <span
          key={i}
          className={`h-3 w-1.5 shrink-0 rounded-sm ${i < fencesLeft ? accent : used}`}
        />
      ))}
    </div>
  )
}
