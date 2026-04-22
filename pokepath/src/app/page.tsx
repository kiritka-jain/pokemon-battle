import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-amber-50 via-zinc-50 to-emerald-50 px-6 py-12 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <main className="w-full max-w-5xl rounded-2xl border border-amber-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 sm:p-10">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            Trainer Welcome
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Begin your Pokepath journey
          </h1>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
            Learn the battle rules, train in local mode, or enter the online arena. Resume unfinished battles anytime
            from your in-progress games page.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/tutorial"
            className="rounded-xl border border-yellow-200 bg-yellow-50/70 p-5 transition-colors hover:bg-yellow-100 dark:border-yellow-900/60 dark:bg-yellow-950/20 dark:hover:bg-yellow-900/30"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700 dark:text-yellow-300">
              Type: Electric
            </p>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Tutorial and rules</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Learn objectives, movement, fences, and winning strategy before your first match.
            </p>
          </Link>

          <Link
            href="/play"
            className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 transition-colors hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              Type: Grass
            </p>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Local practice board</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Practice movement and fence placement on the local board with no sign-in needed.
            </p>
          </Link>

          <Link
            href="/pick"
            className="rounded-xl border border-red-200 bg-red-50/70 p-5 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/25 dark:hover:bg-red-900/30"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
              Type: Normal
            </p>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Choose your partners</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Open two of three Pokéballs and build your two-partner team before heading to the route.
            </p>
          </Link>

          <Link
            href="/lobby"
            className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-5 transition-colors hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
              Type: Dragon
            </p>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Game arena</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Enter the lobby to find matches, track your Elo, and manage online play.
            </p>
          </Link>

          <Link
            href="/lobby/find-match"
            className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/20 dark:hover:bg-rose-900/30"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
              Type: Fire
            </p>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Start online match</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Go directly to matchmaking and create or rejoin an active game with your opponent.
            </p>
          </Link>

          <Link
            href="/lobby/in-progress"
            className="rounded-xl border border-sky-200 bg-sky-50/70 p-5 transition-colors hover:bg-sky-100 dark:border-sky-900/60 dark:bg-sky-950/20 dark:hover:bg-sky-900/30"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
              Type: Water
            </p>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">In-progress games</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Accidentally navigated away? Rejoin ongoing battles instantly from your saved game links.
            </p>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-full bg-rose-700 px-5 text-sm font-medium text-white transition-colors hover:bg-rose-800 dark:bg-rose-600"
          >
            Enter as trainer
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
