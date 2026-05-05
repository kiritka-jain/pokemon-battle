import { HomePageClient } from '@/src/components/home/HomePageClient'
import { HomePokemonBackdrop } from '@/src/components/home/HomePokemonBackdrop'

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-amber-50 via-zinc-50 to-emerald-50 px-6 py-12 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <HomePokemonBackdrop />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-amber-50/85 via-zinc-50/78 to-emerald-50/83 dark:from-zinc-950/88 dark:via-black/74 dark:to-zinc-900/86"
        aria-hidden
      />
      <main className="relative z-10 w-full max-w-5xl sm:rounded-2xl sm:border sm:border-white/55 sm:bg-white/35 sm:p-10 sm:shadow-[0_8px_40px_rgba(0,0,0,0.08)] sm:backdrop-blur-2xl sm:backdrop-saturate-150 sm:dark:border-white/12 sm:dark:bg-zinc-950/45 sm:dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)]">
        <HomePageClient />
      </main>
    </div>
  )
}
