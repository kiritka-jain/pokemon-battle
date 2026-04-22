import Link from 'next/link'

export default function TutorialPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-yellow-50 via-zinc-50 to-sky-50 px-6 py-12 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <main className="w-full max-w-3xl rounded-2xl border border-yellow-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700 dark:text-yellow-300">
              Trainer Handbook
            </p>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Tutorial and game rules</h1>
          </div>
          <Link href="/" className="text-sm font-medium text-rose-700 underline dark:text-rose-400">
            Back home
          </Link>
        </div>

        <div className="mt-6 space-y-6">
          <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Goal</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Reach the opposite side of the board before your opponent.
            </p>
          </section>

          <section className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">On your turn</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              <li>Move your pawn to an adjacent valid tile.</li>
              <li>Or place a fence to slow your opponent.</li>
              <li>A legal path to each goal must always remain open.</li>
            </ul>
          </section>

          <section className="rounded-xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-900/60 dark:bg-violet-950/20">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Winning tips</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              <li>Save fences for moments that force longer detours.</li>
              <li>Do not over-defend; advancing efficiently is often stronger.</li>
              <li>Watch both shortest paths before committing a fence.</li>
            </ul>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/play"
            className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-medium text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600"
          >
            Open practice board
          </Link>
          <Link
            href="/lobby"
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Enter game arena
          </Link>
          <Link
            href="/lobby/in-progress"
            className="inline-flex h-11 items-center justify-center rounded-full border border-sky-300 px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-sky-50 dark:border-sky-700 dark:text-zinc-100 dark:hover:bg-sky-900/30"
          >
            Open in-progress games
          </Link>
        </div>
      </main>
    </div>
  )
}
