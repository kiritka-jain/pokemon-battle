'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'

import type { Session } from '@supabase/supabase-js'

import { StarterPokemonSelection } from '@/src/components/pick/StarterPokemonSelection'
import { safeInternalContinuePath } from '@/src/lib/navigation/safeContinuePath'
import {
  persistPokemonTeamPick,
  type PokemonTeamPickPayload,
} from '@/src/lib/pokemon/pokemonTeamPickStorage'
import { getSession, onAuthStateChange } from '@/src/lib/supabase/auth'
import { supabase } from '@/src/lib/supabase/client'

function trainerDisplayName(sessionUserId: string | null, profileUsername: string | null | undefined) {
  if (sessionUserId == null) return 'Trainer'
  if (profileUsername === undefined) return 'Trainer'
  const trimmed = profileUsername?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : 'Trainer'
}

function PickFallback() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-950 px-6 py-16">
      <p className="text-sm text-zinc-400">Loading…</p>
    </div>
  )
}

function PickContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const continueAfterPick = useMemo(
    () => safeInternalContinuePath(searchParams.get('continue')),
    [searchParams],
  )

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

  const handleChooseRules = (payload: PokemonTeamPickPayload) => {
    persistPokemonTeamPick(payload)
    router.push('/tutorial')
  }

  const handleChoosePlay = (payload: PokemonTeamPickPayload) => {
    persistPokemonTeamPick(payload)
    router.push(continueAfterPick ?? '/play')
  }

  return (
    <StarterPokemonSelection
      username={trainerDisplayName(sessionUserId, profileUsername)}
      onChooseRules={handleChooseRules}
      onChoosePlay={handleChoosePlay}
    />
  )
}

export default function PickPage() {
  return (
    <Suspense fallback={<PickFallback />}>
      <PickContent />
    </Suspense>
  )
}
