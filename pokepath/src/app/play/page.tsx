'use client'

import { useEffect, useState } from 'react'

import { GameBoard } from '@/src/components/board/GameBoard'
import { MobileActionTray } from '@/src/components/ui/MobileActionTray'
import { Scoreboard } from '@/src/components/ui/Scoreboard'
import { buildLocalMatchDisplay } from '@/src/lib/play/localMatchDisplay'
import { useGameStore } from '@/src/lib/store/gameStore'
import { getSession, onAuthStateChange } from '@/src/lib/supabase/auth'
import { supabase } from '@/src/lib/supabase/client'
import type { PlayerKey } from '@/src/types/game'

const LOCAL_MATCH_ID = 'local-dev'
const LOCAL_P1 = 'p1'
const LOCAL_P2 = 'p2'

export default function PlayPage() {
  const [localPlayerKey, setLocalPlayerKey] = useState<PlayerKey>('player1')
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [profileUsername, setProfileUsername] = useState<string | null | undefined>(undefined)

  const turn = useGameStore((s) => s.turn)
  const status = useGameStore((s) => s.status)
  const winner = useGameStore((s) => s.winner)

  useEffect(() => {
    let cancelled = false
    void getSession().then(({ data: { session } }) => {
      if (cancelled) return
      setSessionUserId(session?.user.id ?? null)
    })
    const {
      data: { subscription },
    } = onAuthStateChange((_e, session) => {
      setSessionUserId(session?.user.id ?? null)
      if (!session) {
        setProfileUsername(undefined)
      }
    })
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!sessionUserId) {
      setProfileUsername(undefined)
      return
    }
    setProfileUsername(undefined)
    let cancelled = false
    void supabase
      .from('profiles')
      .select('username')
      .eq('id', sessionUserId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setProfileUsername(data?.username ?? null)
      })
    return () => {
      cancelled = true
    }
  }, [sessionUserId])

  useEffect(() => {
    const display = buildLocalMatchDisplay(sessionUserId, profileUsername)
    useGameStore.getState().initMatch(LOCAL_MATCH_ID, LOCAL_P1, LOCAL_P2, display)
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

      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">Local player:</span>
        <button
          type="button"
          onClick={() => setLocalPlayerKey('player1')}
          className={`rounded-md px-2 py-1 ${localPlayerKey === 'player1' ? 'bg-red-200 dark:bg-red-900/50' : 'bg-zinc-200 dark:bg-zinc-800'}`}
        >
          P1
        </button>
        <button
          type="button"
          onClick={() => setLocalPlayerKey('player2')}
          className={`rounded-md px-2 py-1 ${localPlayerKey === 'player2' ? 'bg-blue-200 dark:bg-blue-900/50' : 'bg-zinc-200 dark:bg-zinc-800'}`}
        >
          P2
        </button>
      </div>

      <Scoreboard localPlayerKey={localPlayerKey} />

      <GameBoard localPlayerKey={localPlayerKey} />

      <MobileActionTray />
    </div>
  )
}
