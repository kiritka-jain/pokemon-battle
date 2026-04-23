import Link from 'next/link'

import { ProfessorOakFigure } from '@/src/components/tutorial/ProfessorOakFigure'
import { RulesCloudDeck } from '@/src/components/tutorial/RulesCloudDeck'

export default function TutorialPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-yellow-50 via-zinc-50 to-sky-50 px-4 py-10 dark:from-zinc-950 dark:via-black dark:to-zinc-900 sm:px-6 sm:py-12">
      <main className="w-full max-w-5xl rounded-2xl border border-yellow-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 sm:p-8 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700 dark:text-yellow-300">
              Trainer Handbook
            </p>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Game rules</h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              Professor Oak walks you through the essentials—one rule at a time.
            </p>
          </div>
          <Link href="/" className="shrink-0 text-sm font-medium text-rose-700 underline dark:text-rose-400">
            Back home
          </Link>
        </div>

        <div className="mt-8 flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-between md:gap-8 lg:gap-12">
          <ProfessorOakFigure />
          <div className="flex w-full min-w-0 flex-1 flex-col items-center md:max-w-[58%] md:items-start">
            <RulesCloudDeck />
            <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400 md:text-left">
              Ready to practice?{' '}
              <Link href="/play" className="font-medium text-emerald-700 underline dark:text-emerald-400">
                Open the practice board
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
