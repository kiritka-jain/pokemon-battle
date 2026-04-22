'use client'

import { useEffect, useRef, useState } from 'react'

import type { Session } from '@supabase/supabase-js'

import { GameBoard } from '@/src/components/board/GameBoard'
import { MobileActionTray } from '@/src/components/ui/MobileActionTray'
import { PortraitOnlyGameShell } from '@/src/components/ui/PortraitOnlyGameShell'
import { Scoreboard, type ScoreboardTurnStripMode } from '@/src/components/ui/Scoreboard'
import { buildLocalMatchDisplay } from '@/src/lib/play/localMatchDisplay'
import { LOCAL_DEV_MATCH_ID, useGameStore } from '@/src/lib/store/gameStore'
import { getSession, onAuthStateChange } from '@/src/lib/supabase/auth'
import { supabase } from '@/src/lib/supabase/client'

const LOCAL_P1 = 'p1'
const LOCAL_P2 = 'p2'

const PLAY_TURN_STRIP: ScoreboardTurnStripMode = 'activePlayer'

export default function PlayPage() {
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [profileUsername, setProfileUsername] = useState<string | null | undefined>(undefined)
  const profileFetchSeq = useRef(0)

  const turn = useGameStore((s) => s.turn)
  const actingUserId = useGameStore((s) => s.players[s.turn].id)
  const status = useGameStore((s) => s.status)
  const winner = useGameStore((s) => s.winner)

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

  useEffect(() => {
    const display = buildLocalMatchDisplay(sessionUserId, profileUsername)
    useGameStore.getState().initMatch(LOCAL_DEV_MATCH_ID, LOCAL_P1, LOCAL_P2, display)
  }, [sessionUserId, profileUsername])

  return (
    // pb-32: MobileActionTray is fixed bottom-0 and always mounted; padding keeps the board scrollable above it.
    <div className="flex min-h-full flex-col items-center gap-4 px-4 pb-32 pt-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          PokéPath — Route Rush
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Local board · Turn: {turn}
          {winner && ` · Winner: ${winner}`}
          {status === 'finished' && ' · Game over'}
        </p>
      </div>

      <PortraitOnlyGameShell>
        <Scoreboard localPlayerKey={turn} turnStripMode={PLAY_TURN_STRIP} />

        <GameBoard localPlayerKey={turn} viewAsPlayer="player1" />

        <MobileActionTray actingUserId={actingUserId} />
      </PortraitOnlyGameShell>
    </div>
  )
}
