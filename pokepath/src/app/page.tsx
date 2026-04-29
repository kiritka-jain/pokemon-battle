import { HomePageClient } from '@/src/components/home/HomePageClient'

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-amber-50 via-zinc-50 to-emerald-50 px-6 py-12 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <main className="w-full max-w-5xl rounded-2xl border border-amber-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 sm:p-10">
        <HomePageClient />
      </main>
    </div>
  )
}
