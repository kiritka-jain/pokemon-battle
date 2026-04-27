'use client'

import { useEffect, useRef, useState } from 'react'

import type { Session } from '@supabase/supabase-js'

import { welcomeDisplayName } from '@/src/lib/home/welcomeDisplayName'
import { getSession, onAuthStateChange } from '@/src/lib/supabase/auth'
import { supabase } from '@/src/lib/supabase/client'

export function HomeHero() {
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [profileUsername, setProfileUsername] = useState<string | null | undefined>(undefined)
  const profileFetchSeq = useRef(0)

  useEffect(() => {
    let cancelled = false

    const applySession = (session: Session | null) => {
      if (cancelled) return
      const id = session?.user.id ?? null
      setSessionUserId(id)
      if (!id) {
        setProfileUsername(undefined)
        return
      }
      setProfileUsername(undefined)
      const seq = ++profileFetchSeq.current
      void supabase
        .from('profiles')
        .select('username')
        .eq('id', id)
        .maybeSingle()
        .then(({ data }) => {
          if (cancelled || seq !== profileFetchSeq.current) return
          setProfileUsername(data?.username ?? null)
        })
    }

    const scheduleApplySession = (session: Session | null) => {
      queueMicrotask(() => applySession(session))
    }

    void getSession().then(({ data: { session } }) => {
      scheduleApplySession(session)
    })

    const {
      data: { subscription },
    } = onAuthStateChange((_e, session) => {
      scheduleApplySession(session)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const name = welcomeDisplayName({ sessionUserId, profileUsername })

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
        Welcome, {name}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        Race the route, block the path
      </h1>
      <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:text-base">
        PokéPath: Route Rush is a Pokémon-themed tactical board duel. Move your Pokemon
        across the 9x9 route, place fences to force detours, and reach the far side first.
      </p>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        Not a traditional Pokémon battle simulator: a quick route strategy game.
      </p>
    </div>
  )
}
