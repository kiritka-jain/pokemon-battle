import Link from 'next/link'

import { ProfessorOakFigure } from '@/src/components/tutorial/ProfessorOakFigure'
import { RulesCloudDeck } from '@/src/components/tutorial/RulesCloudDeck'

export default function TutorialPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-yellow-50 via-zinc-50 to-sky-50 px-4 py-10 dark:from-zinc-950 dark:via-black dark:to-zinc-900 sm:px-6 sm:py-12">
      <main className="w-full max-w-6xl rounded-2xl border border-yellow-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 sm:p-8 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700 dark:text-yellow-300">
              Route Rush Handbook
            </p>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Learn the route duel
            </h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              Short rules below—swipe or use the dots to read each one before you play.
            </p>
          </div>
          <Link href="/" className="shrink-0 text-sm font-medium text-rose-700 underline dark:text-rose-400">
            Back home
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 md:grid-cols-3 md:gap-10 lg:gap-12">
          <div className="flex w-full justify-center md:block md:w-auto">
            <ProfessorOakFigure />
          </div>
          <div className="flex min-w-0 flex-col items-center md:col-span-2 md:items-start">
            <RulesCloudDeck />
            <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400 md:text-left">
              Ready to practice?{' '}
              <Link href="/play/vs-computer" className="font-medium text-emerald-700 underline dark:text-emerald-400">
                Play vs computer
              </Link>
              {' · '}
              <Link href="/play" className="font-medium text-emerald-700 underline dark:text-emerald-400">
                Pass-and-play board
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
