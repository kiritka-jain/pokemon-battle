import Link from 'next/link'

import type { HomeActionTile } from '@/src/lib/home/homeActionTiles'

const ACCENT_LINK_CLASS: Record<HomeActionTile['accent'], string> = {
  yellow:
    'border-yellow-200/80 bg-gradient-to-br from-yellow-50/45 to-white/30 hover:from-yellow-50/65 hover:to-white/40 dark:border-yellow-800/40 dark:from-yellow-950/35 dark:to-zinc-950/25 dark:hover:from-yellow-950/45 dark:hover:to-zinc-950/35',
  emerald:
    'border-emerald-200/80 bg-gradient-to-br from-emerald-50/45 to-white/30 hover:from-emerald-50/65 hover:to-white/40 dark:border-emerald-800/40 dark:from-emerald-950/35 dark:to-zinc-950/25 dark:hover:from-emerald-950/45 dark:hover:to-zinc-950/35',
  indigo:
    'border-indigo-200/80 bg-gradient-to-br from-indigo-50/45 to-white/30 hover:from-indigo-50/65 hover:to-white/40 dark:border-indigo-800/40 dark:from-indigo-950/35 dark:to-zinc-950/25 dark:hover:from-indigo-950/45 dark:hover:to-zinc-950/35',
}

export function HomeActionGrid({ tiles }: { tiles: HomeActionTile[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map((tile) => (
        <Link
          key={`${tile.href}-${tile.title}`}
          href={tile.href}
          className={`block h-full rounded-xl border border-white/50 p-5 shadow-sm backdrop-blur-md transition-colors dark:border-white/10 ${ACCENT_LINK_CLASS[tile.accent]}`}
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{tile.title}</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{tile.description}</p>
        </Link>
      ))}
    </div>
  )
}
