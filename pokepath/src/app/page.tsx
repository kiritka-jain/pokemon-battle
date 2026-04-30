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
      <main className="relative z-10 w-full max-w-5xl rounded-2xl border border-white/55 bg-white/35 p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/12 dark:bg-zinc-950/45 dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)] sm:p-10">
        <HomePageClient />
      </main>
    </div>
  )
}
