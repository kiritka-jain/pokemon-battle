'use client'

import Image from 'next/image'

import { displayNameForSeat } from '@/src/lib/playerDisplayName'
import { starterSpeciesById } from '@/src/lib/pokemon/starterRoster'
import { useGameStore } from '@/src/lib/store/gameStore'
import type { PlayerKey, PlayerState } from '@/src/types/game'

/** Positioning shell only — no disk, ring, or shadow (Pokémon reads as on the field). */
const BOARD_POKEMON_SHELL_BASE =
  'absolute h-[11%] max-h-14 w-[11%] max-w-14 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-sm transition-all duration-300 ease-in-out'

type PlayerSpritesProps = {
  /** Seat perspective for board rotation; sprite facing undoes rotation in token space. */
  viewAsPlayer?: PlayerKey
}

/**
 * Renders both trainers as absolutely positioned layers over the board grid.
 */
export function PlayerSprites({ viewAsPlayer = 'player1' }: PlayerSpritesProps) {
  const p1 = useGameStore((s) => s.players.player1)
  const p2 = useGameStore((s) => s.players.player2)

  const styleFor = (x: number, y: number) => ({
    left: `${((x + 0.5) / 9) * 100}%`,
    top: `${((y + 0.5) / 9) * 100}%`,
  })

  const name1 = displayNameForSeat({ username: p1.username, userId: p1.id })
  const name2 = displayNameForSeat({ username: p2.username, userId: p2.id })

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <BoardPokemonToken
        playerKey="player1"
        player={p1}
        trainerLabel={name1}
        style={styleFor(p1.pos.x, p1.pos.y)}
        viewAsPlayer={viewAsPlayer}
      />
      <BoardPokemonToken
        playerKey="player2"
        player={p2}
        trainerLabel={name2}
        style={styleFor(p2.pos.x, p2.pos.y)}
        viewAsPlayer={viewAsPlayer}
      />
    </div>
  )
}

function BoardPokemonToken({
  playerKey,
  player,
  trainerLabel,
  style,
  viewAsPlayer,
}: {
  playerKey: PlayerKey
  player: PlayerState
  trainerLabel: string
  style: { left: string; top: string }
  viewAsPlayer: PlayerKey
}) {
  const species = player.pawnSpeciesId
    ? starterSpeciesById(player.pawnSpeciesId)
    : undefined

  const seatLabel = playerKey === 'player1' ? 'Player 1' : 'Player 2'
  const ariaLabel =
    species != null
      ? `${species.displayName}, ${seatLabel}, ${trainerLabel}`
      : `${seatLabel}, ${trainerLabel}`

  const shellClass = `${BOARD_POKEMON_SHELL_BASE} bg-transparent`

  /** Undo board `rotate-180` for this subtree so facing stays in engine (+y / −y home) space. */
  const seatCounterClass =
    viewAsPlayer === 'player2' ? 'h-full w-full origin-center rotate-180' : 'h-full w-full'
  /** Player 2 home is y=0 (up in engine); mirror horizontally so art faces the far row without inverting upright sprites. */
  const faceHomeClass =
    playerKey === 'player2' ? 'h-full w-full origin-center scale-x-[-1]' : 'h-full w-full'

  if (species?.imageSrc) {
    return (
      <div className={shellClass} style={style} aria-label={ariaLabel}>
        <div className={seatCounterClass}>
          <div className={`relative h-full w-full ${faceHomeClass}`}>
            <Image
              src={species.imageSrc}
              alt=""
              fill
              className="object-cover object-center"
              sizes="56px"
              priority
            />
          </div>
        </div>
      </div>
    )
  }

  if (species) {
    return (
      <div className={shellClass} style={style} aria-label={ariaLabel}>
        <div className={seatCounterClass}>
          <div className={`relative flex h-full w-full items-center justify-center text-2xl sm:text-3xl ${faceHomeClass}`}>
            <span aria-hidden>{species.emoji}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${shellClass} flex items-center justify-center bg-zinc-200/40 dark:bg-zinc-800/40`}
      style={style}
      aria-label={ariaLabel}
    >
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400" aria-hidden>
        …
      </span>
    </div>
  )
}
