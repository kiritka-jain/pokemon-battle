import { HomePageClient } from '@/src/components/home/HomePageClient'
import { HomePokemonBackdrop } from '@/src/components/home/HomePokemonBackdrop'

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-amber-50 via-zinc-50 to-emerald-50 px-6 py-12 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <HomePokemonBackdrop />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-amber-50/72 via-zinc-50/65 to-emerald-50/70 dark:from-zinc-950/76 dark:via-black/62 dark:to-zinc-900/74"
        aria-hidden
      />
      <main className="relative z-10 w-full max-w-5xl sm:rounded-2xl sm:border sm:border-white/45 sm:bg-white/22 sm:p-10 sm:shadow-[0_6px_28px_rgba(0,0,0,0.06)] sm:backdrop-blur-lg sm:backdrop-saturate-150 sm:dark:border-white/10 sm:dark:bg-zinc-950/32 sm:dark:shadow-[0_6px_28px_rgba(0,0,0,0.35)]">
        <HomePageClient />
      </main>
    </div>
  )
}
