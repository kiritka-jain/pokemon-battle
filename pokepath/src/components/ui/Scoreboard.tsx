'use client'

import { displayNameForSeat } from '@/src/lib/playerDisplayName'
import { useGameStore } from '@/src/lib/store/gameStore'
import { STARTING_FENCES, type PlayerKey } from '@/src/types/game'

import { FenceInventory } from './FenceInventory'

type ScoreboardProps = {
  localPlayerKey: PlayerKey
}

export function Scoreboard({ localPlayerKey }: ScoreboardProps) {
  const turn = useGameStore((s) => s.turn)
  const status = useGameStore((s) => s.status)
  const winner = useGameStore((s) => s.winner)
  const p1 = useGameStore((s) => s.players.player1)
  const p2 = useGameStore((s) => s.players.player2)

  const name1 = displayNameForSeat({ username: p1.username, userId: p1.id })
  const name2 = displayNameForSeat({ username: p2.username, userId: p2.id })
  const elo1 = p1.elo ?? 1000
  const elo2 = p2.elo ?? 1000

  const opponentKey: PlayerKey = localPlayerKey === 'player1' ? 'player2' : 'player1'
  const opponentFencesLeft = opponentKey === 'player1' ? p1.fencesLeft : p2.fencesLeft

  let turnStripLabel: string
  let turnStripClass: string
  if (status === 'active' && winner === null) {
    if (turn === localPlayerKey) {
      turnStripLabel = 'Your turn'
      turnStripClass =
        'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950'
    } else {
      turnStripLabel = "Opponent's turn"
      turnStripClass =
        'bg-zinc-200 text-zinc-900 dark:bg-zinc-600 dark:text-zinc-50'
    }
  } else if (winner !== null || status === 'finished') {
    turnStripLabel = 'Game over'
    turnStripClass =
      'bg-zinc-300/80 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
  } else {
    turnStripLabel = 'Waiting'
    turnStripClass =
      'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
  }

  return (
    <header className="flex w-full max-w-[520px] flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/90 px-3 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
      <div
        className={`rounded-lg px-3 py-2 text-center text-sm font-semibold leading-snug ${turnStripClass}`}
        role="status"
        aria-live="polite"
      >
        {turnStripLabel}
      </div>

      <p className="text-center text-sm font-medium leading-snug text-zinc-800 dark:text-zinc-200">
        Opponent fences remaining: {opponentFencesLeft}
      </p>

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
