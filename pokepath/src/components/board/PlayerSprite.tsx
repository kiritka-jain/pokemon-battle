'use client'

import Image from 'next/image'

import { displayNameForSeat } from '@/src/lib/playerDisplayName'
import { starterSpeciesById } from '@/src/lib/pokemon/starterRoster'
import { useGameStore } from '@/src/lib/store/gameStore'
import type { PlayerKey, PlayerState } from '@/src/types/game'

/**
 * Renders both trainers as absolutely positioned layers over the board grid.
 */
export function PlayerSprites() {
  const p1 = useGameStore((s) => s.players.player1)
  const p2 = useGameStore((s) => s.players.player2)

  const styleFor = (x: number, y: number) => ({
    left: `${((x + 0.5) / 9) * 100}%`,
    top: `${((y + 0.5) / 9) * 100}%`,
  })

  const redName = displayNameForSeat({ username: p1.username, userId: p1.id })
  const blueName = displayNameForSeat({ username: p2.username, userId: p2.id })

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <PawnToken
        playerKey="player1"
        player={p1}
        trainerLabel={redName}
        seatClass="bg-red-500 ring-red-900/30"
        style={styleFor(p1.pos.x, p1.pos.y)}
      />
      <PawnToken
        playerKey="player2"
        player={p2}
        trainerLabel={blueName}
        seatClass="bg-blue-500 ring-blue-900/30"
        style={styleFor(p2.pos.x, p2.pos.y)}
      />
    </div>
  )
}

function PawnToken({
  playerKey,
  player,
  trainerLabel,
  seatClass,
  style,
}: {
  playerKey: PlayerKey
  player: PlayerState
  trainerLabel: string
  seatClass: string
  style: { left: string; top: string }
}) {
  const species = player.pawnSpeciesId
    ? starterSpeciesById(player.pawnSpeciesId)
    : undefined

  const seatName = playerKey === 'player1' ? 'Red trainer' : 'Blue trainer'
  const ariaLabel =
    species != null
      ? `${species.displayName}, ${seatName}, ${trainerLabel}`
      : `${seatName}, ${trainerLabel}`

  const shellClass =
    'absolute h-[11%] max-h-14 w-[11%] max-w-14 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full shadow-md ring-2 transition-all duration-300 ease-in-out ' +
    seatClass

  if (species?.imageSrc) {
    return (
      <div className={shellClass} style={style} aria-label={ariaLabel}>
        <Image
          src={species.imageSrc}
          alt=""
          fill
          className="object-cover object-center"
          sizes="56px"
          priority
        />
      </div>
    )
  }

  if (species) {
    return (
      <div
        className={`${shellClass} flex items-center justify-center text-2xl sm:text-3xl`}
        style={style}
        aria-label={ariaLabel}
      >
        <span aria-hidden>{species.emoji}</span>
      </div>
    )
  }

  return (
    <div className={shellClass} style={style} aria-label={ariaLabel} />
  )
}
