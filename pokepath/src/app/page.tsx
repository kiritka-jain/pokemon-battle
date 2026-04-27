import Link from 'next/link'

import { HomeHero } from '@/src/components/home/HomeHero'

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-amber-50 via-zinc-50 to-emerald-50 px-6 py-12 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <main className="w-full max-w-5xl rounded-2xl border border-amber-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 sm:p-10">
        <HomeHero />

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/tutorial"
            className="block w-full rounded-xl border border-yellow-200 bg-yellow-50/70 p-5 transition-colors hover:bg-yellow-100 dark:border-yellow-900/60 dark:bg-yellow-950/20 dark:hover:bg-yellow-900/30"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Learn Route Rush</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Learn the route-racing rules, fence limits, jumps, and the path-of-hope rule
              before your first duel.
            </p>
          </Link>

          <Link
            href="/play/vs-computer"
            className="block w-full rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 transition-colors hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Practice vs computer</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Play a full route duel against a local AI with difficulty levels and undo—no ranked
              impact.
            </p>
          </Link>

          <Link
            href="/play"
            className="block w-full rounded-xl border border-teal-200 bg-teal-50/70 p-5 transition-colors hover:bg-teal-100 dark:border-teal-900/50 dark:bg-teal-950/20 dark:hover:bg-teal-900/30"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Pass-and-play board</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Try movement and fence placement on a shared device with no sign-in needed.
            </p>
          </Link>

          <Link
            href="/pick"
            className="block w-full rounded-xl border border-red-200 bg-red-50/70 p-5 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/25 dark:hover:bg-red-900/30"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Choose your Pokemons</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Open two of three Pokéballs and pick the Pokemon who will represent you on the route.
            </p>
          </Link>

          <Link
            href="/lobby"
            className="block w-full rounded-xl border border-indigo-200 bg-indigo-50/70 p-5 transition-colors hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Ranked route arena</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Enter the lobby to find route duels, track your Elo, and manage online play.
            </p>
          </Link>

          <Link
            href="/lobby/find-match"
            className="block w-full rounded-xl border border-rose-200 bg-rose-50/70 p-5 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/20 dark:hover:bg-rose-900/30"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Find ranked duel</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Queue for a live opponent and race across the board in a tactical Route Rush match.
            </p>
          </Link>

          <Link
            href="/lobby/in-progress"
            className="block w-full rounded-xl border border-sky-200 bg-sky-50/70 p-5 transition-colors hover:bg-sky-100 dark:border-sky-900/60 dark:bg-sky-950/20 dark:hover:bg-sky-900/30"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">In-progress games</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Accidentally navigated away? Rejoin ongoing route duels from your saved game links.
            </p>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-full bg-rose-700 px-5 text-sm font-medium text-white transition-colors hover:bg-rose-800 dark:bg-rose-600"
          >
            Enter as route trainer
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex h-11 items-center justify-center rounded-full border border-indigo-300 px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-indigo-50 dark:border-indigo-700 dark:text-zinc-100 dark:hover:bg-indigo-900/30"
          >
            Champion leaderboard
          </Link>
        </div>
      </main>
    </div>
  )
}
