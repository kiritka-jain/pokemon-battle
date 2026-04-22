'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import type { Session } from '@supabase/supabase-js'

import { StarterPokemonSelection } from '@/src/components/pick/StarterPokemonSelection'
import {
  PARTNER_PICK_STORAGE_KEY,
  serializePartnerPick,
  type PartnerPickPayload,
} from '@/src/lib/pokemon/partnerPickStorage'
import { getSession, onAuthStateChange } from '@/src/lib/supabase/auth'
import { supabase } from '@/src/lib/supabase/client'

function trainerDisplayName(sessionUserId: string | null, profileUsername: string | null | undefined) {
  if (sessionUserId == null) return 'Trainer'
  if (profileUsername === undefined) return 'Trainer'
  const trimmed = profileUsername?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : 'Trainer'
}

export default function PickPage() {
  const router = useRouter()
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

  const handleContinue = (payload: PartnerPickPayload) => {
    try {
      sessionStorage.setItem(PARTNER_PICK_STORAGE_KEY, serializePartnerPick(payload))
    } catch {
      // ignore quota / private mode
    }
    router.push('/play')
  }

  return (
    <StarterPokemonSelection
      username={trainerDisplayName(sessionUserId, profileUsername)}
      onContinue={handleContinue}
    />
  )
}
