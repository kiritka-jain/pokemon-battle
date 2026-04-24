'use client'

import type { BoardMood } from '@/src/lib/board/arenaTheme'
import { useBoardVisualPrefsStore } from '@/src/lib/store/boardVisualPrefsStore'

const MOOD_OPTIONS: { value: BoardMood; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'route', label: 'Route' },
  { value: 'gym', label: 'Gym' },
  { value: 'battleNight', label: 'Night' },
]

type BoardVisualSettingsProps = {
  /** Tighter layout for match header area */
  compact?: boolean
}

export function BoardVisualSettings({ compact = false }: BoardVisualSettingsProps) {
  const boardMood = useBoardVisualPrefsStore((s) => s.boardMood)
  const highContrastBoard = useBoardVisualPrefsStore((s) => s.highContrastBoard)
  const setBoardMood = useBoardVisualPrefsStore((s) => s.setBoardMood)
  const setHighContrastBoard = useBoardVisualPrefsStore((s) => s.setHighContrastBoard)

  return (
    <div
      className={`flex w-full max-w-[520px] flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-zinc-200/90 bg-white/80 px-2.5 py-2 text-zinc-800 shadow-sm backdrop-blur dark:border-zinc-700/80 dark:bg-zinc-900/70 dark:text-zinc-100 ${
        compact ? 'text-xs' : 'text-sm'
      }`}
    >
      <label className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial">
        <span className="shrink-0 font-medium text-zinc-600 dark:text-zinc-300">Board look</span>
        <select
          className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 sm:min-w-[9rem]"
          value={boardMood}
          onChange={(e) => setBoardMood(e.target.value as BoardMood)}
        >
          {MOOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          className="size-4 rounded border-zinc-400 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-500"
          checked={highContrastBoard}
          onChange={(e) => setHighContrastBoard(e.target.checked)}
        />
        <span className="font-medium text-zinc-600 dark:text-zinc-300">High contrast</span>
      </label>
    </div>
  )
}
