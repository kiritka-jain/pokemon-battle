'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  parsePresencePlayers,
  searchingUserIds,
} from '@/src/lib/matchmaking/presenceHelpers'
import { supabase } from '@/src/lib/supabase/client'

const MATCHMAKING_CHANNEL = 'matchmaking'

type LobbyProfile = { username: string; elo_rating: number } | null

/**
 * Read-only matchmaking presence: shows online / searching counts without
 * participating in pairing or broadcast handlers.
 */
export function useMatchmakingPresencePreview(
  userId: string | undefined,
  profile: LobbyProfile,
) {
  const [onlineCount, setOnlineCount] = useState(0)
  const [searchingCount, setSearchingCount] = useState(0)
  const [subscribed, setSubscribed] = useState(false)

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const profileRef = useRef(profile)
  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  const refresh = useCallback(() => {
    const ch = channelRef.current
    if (!ch) return
    const raw = ch.presenceState() as Record<string, unknown[] | undefined>
    const players = parsePresencePlayers(raw)
    setOnlineCount(players.length)
    setSearchingCount(searchingUserIds(players).length)
  }, [])

  const trackIdle = useCallback(async () => {
    const ch = channelRef.current
    const uid = userId
    if (!ch || !uid) return
    const pr = profileRef.current
    await ch.track({
      userId: uid,
      username: pr?.username?.trim() ? pr.username : uid.slice(0, 8),
      elo: pr?.elo_rating ?? 1200,
      searching: false,
      updatedAt: new Date().toISOString(),
    })
    refresh()
  }, [userId, refresh])

  useEffect(() => {
    if (!userId) return

    const ch = supabase.channel(MATCHMAKING_CHANNEL, {
      config: {
        presence: { key: userId },
        broadcast: { self: true },
      },
    })
    channelRef.current = ch

    ch.on('presence', { event: 'sync' }, refresh)
    ch.on('presence', { event: 'join' }, refresh)
    ch.on('presence', { event: 'leave' }, refresh)

    void ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setSubscribed(true)
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setSubscribed(false)
      }
    })

    return () => {
      channelRef.current = null
      setSubscribed(false)
      setOnlineCount(0)
      setSearchingCount(0)
      void supabase.removeChannel(ch)
    }
  }, [userId, refresh])

  useEffect(() => {
    if (!subscribed) return
    void trackIdle()
  }, [subscribed, profile?.username, profile?.elo_rating, trackIdle])

  return {
    onlineCount,
    searchingCount,
    /** True once channel has subscribed (presence counts are meaningful). */
    subscribed,
  }
}
