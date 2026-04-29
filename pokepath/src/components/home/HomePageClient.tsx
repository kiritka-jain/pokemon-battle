'use client'

import { useEffect, useState } from 'react'

import type { Session } from '@supabase/supabase-js'

import { HomeActionGrid } from '@/src/components/home/HomeActionGrid'
import { HomeHero } from '@/src/components/home/HomeHero'
import { homeActionTiles } from '@/src/lib/home/homeActionTiles'
import { getSession, onAuthStateChange } from '@/src/lib/supabase/auth'

function GuestHomeHeader() {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
        PokéPath: Route Rush
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        Race the route, block the path
      </h1>
      <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:text-base">
        A Pokémon-themed tactical board duel—move across the 9×9 route, place fences, and reach the
        far side first.
      </p>
    </div>
  )
}

export function HomePageClient() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    void getSession().then(({ data: { session: s } }) => {
      if (cancelled) return
      setSession(s)
      setReady(true)
    })

    const {
      data: { subscription },
    } = onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] flex-1 items-center justify-center px-6 py-12">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</p>
      </div>
    )
  }

  const isAuthed = Boolean(session)
  const tiles = homeActionTiles(isAuthed)

  return (
    <>
      {isAuthed ? (
        <>
          <HomeHero />
          <div className="mt-8">
            <HomeActionGrid tiles={tiles} />
          </div>
        </>
      ) : (
        <>
          <GuestHomeHeader />
          <div className="mt-8">
            <HomeActionGrid tiles={tiles} />
          </div>
        </>
      )}
    </>
  )
}
