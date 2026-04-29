import Link from 'next/link'

import type { HomeActionTile } from '@/src/lib/home/homeActionTiles'

const ACCENT_LINK_CLASS: Record<HomeActionTile['accent'], string> = {
  yellow:
    'border-yellow-200 bg-yellow-50/70 hover:bg-yellow-100 dark:border-yellow-900/60 dark:bg-yellow-950/20 dark:hover:bg-yellow-900/30',
  emerald:
    'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30',
  red: 'border-red-200 bg-red-50/70 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/25 dark:hover:bg-red-900/30',
  indigo:
    'border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30',
}

export function HomeActionGrid({ tiles }: { tiles: HomeActionTile[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Link
          key={`${tile.href}-${tile.title}`}
          href={tile.href}
          className={`block h-full rounded-xl border p-5 transition-colors ${ACCENT_LINK_CLASS[tile.accent]}`}
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{tile.title}</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{tile.description}</p>
        </Link>
      ))}
    </div>
  )
}
