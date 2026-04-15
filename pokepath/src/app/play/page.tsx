'use client'

import { useEffect, useState } from 'react'

import { GameBoard } from '@/src/components/board/GameBoard'
import { useGameStore } from '@/src/lib/store/gameStore'
import type { PlayerKey } from '@/src/types/game'

export default function PlayPage() {
  const [localPlayerKey, setLocalPlayerKey] = useState<PlayerKey>('player1')
  const error = useGameStore((s) => s.error)
  const pendingAction = useGameStore((s) => s.pendingAction)
  const turn = useGameStore((s) => s.turn)
  const status = useGameStore((s) => s.status)
  const winner = useGameStore((s) => s.winner)

  useEffect(() => {
    useGameStore.getState().initMatch('local-dev', 'p1', 'p2')
  }, [])

  return (
    <div className="flex min-h-full flex-col items-center gap-4 px-4 py-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          PokéPath — Route Rush
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Local board · Turn: {turn}
          {winner && ` · Winner: ${winner}`}
          {status === 'finished' && ' · Game over'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">Local player:</span>
        <button
          type="button"
          onClick={() => setLocalPlayerKey('player1')}
          className={`rounded-md px-2 py-1 ${localPlayerKey === 'player1' ? 'bg-red-200 dark:bg-red-900/50' : 'bg-zinc-200 dark:bg-zinc-800'}`}
        >
          P1
        </button>
        <button
          type="button"
          onClick={() => setLocalPlayerKey('player2')}
          className={`rounded-md px-2 py-1 ${localPlayerKey === 'player2' ? 'bg-blue-200 dark:bg-blue-900/50' : 'bg-zinc-200 dark:bg-zinc-800'}`}
        >
          P2
        </button>
      </div>

      <GameBoard localPlayerKey={localPlayerKey} />

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={pendingAction.type === null}
          onClick={() => useGameStore.getState().commitAction()}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pendingAction.type === 'move'
            ? 'Confirm move'
            : pendingAction.type === 'fence'
              ? 'Confirm fence'
              : 'Confirm'}
        </button>
        <button
          type="button"
          disabled={pendingAction.type === null}
          onClick={() => useGameStore.getState().clearPendingAction()}
          className="rounded-lg border border-zinc-400 px-4 py-2 text-sm font-medium text-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-200"
        >
          Cancel
        </button>
      </div>

      {error ? (
        <p className="max-w-md text-center text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
