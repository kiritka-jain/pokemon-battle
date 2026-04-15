'use client'

import { useGameStore } from '@/src/lib/store/gameStore'
import { STARTING_FENCES } from '@/src/types/game'

import { FenceInventory } from './FenceInventory'

export function Scoreboard() {
  const turn = useGameStore((s) => s.turn)
  const p1 = useGameStore((s) => s.players.player1)
  const p2 = useGameStore((s) => s.players.player2)

  const name1 = p1.username ?? 'Player 1'
  const name2 = p2.username ?? 'Player 2'
  const elo1 = p1.elo ?? 1000
  const elo2 = p2.elo ?? 1000

  return (
    <header className="w-full max-w-[520px] rounded-xl border border-zinc-200 bg-zinc-50/90 px-3 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
      <div className="flex items-stretch justify-between gap-3">
        <section
          className={`min-w-0 flex-1 rounded-lg px-2 py-1 transition-[box-shadow] ${
            turn === 'player1'
              ? 'shadow-[0_0_0_2px_rgba(220,38,38,0.55)] dark:shadow-[0_0_0_2px_rgba(248,113,113,0.45)]'
              : ''
          }`}
          data-active-turn={turn === 'player1' ? 'true' : undefined}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span
              className={`truncate text-sm ${turn === 'player1' ? 'font-bold text-zinc-900 dark:text-zinc-50' : 'font-medium text-zinc-700 dark:text-zinc-300'}`}
            >
              {name1}
            </span>
            {turn === 'player1' ? (
              <span className="shrink-0 text-xs font-medium text-red-600 dark:text-red-400" aria-hidden>
                ▶
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Elo {elo1}</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
            Fences: {p1.fencesLeft}/{STARTING_FENCES}
          </p>
          <div className="mt-1.5">
            <FenceInventory playerKey="player1" />
          </div>
        </section>

        <div
          className="flex shrink-0 items-center self-center px-1 text-xs font-medium text-zinc-400 dark:text-zinc-500"
          aria-hidden
        >
          VS
        </div>

        <section
          className={`min-w-0 flex-1 rounded-lg px-2 py-1 text-right transition-[box-shadow] ${
            turn === 'player2'
              ? 'shadow-[0_0_0_2px_rgba(37,99,235,0.55)] dark:shadow-[0_0_0_2px_rgba(96,165,250,0.45)]'
              : ''
          }`}
          data-active-turn={turn === 'player2' ? 'true' : undefined}
        >
          <div className="flex items-baseline justify-end gap-2">
            {turn === 'player2' ? (
              <span className="shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400" aria-hidden>
                ◀
              </span>
            ) : null}
            <span
              className={`truncate text-sm ${turn === 'player2' ? 'font-bold text-zinc-900 dark:text-zinc-50' : 'font-medium text-zinc-700 dark:text-zinc-300'}`}
            >
              {name2}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Elo {elo2}</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
            Fences: {p2.fencesLeft}/{STARTING_FENCES}
          </p>
          <div className="mt-1.5 flex justify-end">
            <FenceInventory playerKey="player2" />
          </div>
        </section>
      </div>
    </header>
  )
}
