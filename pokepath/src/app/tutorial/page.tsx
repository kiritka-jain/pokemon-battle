import Link from 'next/link'

import { GuidedPracticePanel } from '@/src/components/tutorial/GuidedPracticePanel'
import { ProfessorOakFigure } from '@/src/components/tutorial/ProfessorOakFigure'
import { RulesCloudDeck } from '@/src/components/tutorial/RulesCloudDeck'
import { STRATEGY_GUIDE } from '@/src/lib/tutorial/gameRules'

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
              Professor Oak explains how to win this Pokémon-themed path strategy game:
              race to the far side, place clever fences, jump rivals, and never seal every route.
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

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STRATEGY_GUIDE.map((item) => (
            <section
              key={item.title}
              className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 dark:border-sky-950 dark:bg-sky-950/20"
            >
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-8">
          <GuidedPracticePanel />
        </div>
      </main>
    </div>
  )
}
