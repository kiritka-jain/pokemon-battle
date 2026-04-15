'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { getSession, onAuthStateChange } from '@/src/lib/supabase/auth'
import { supabase } from '@/src/lib/supabase/client'

type Profile = {
  id: string
  username: string
  elo_rating: number
  total_wins: number
  total_losses: number
}

function winRate(wins: number, losses: number): string {
  const total = wins + losses
  if (total === 0) return '—'
  return `${Math.round((wins / total) * 100)}%`
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [rows, setRows] = useState<Profile[]>([])
  const [myId, setMyId] = useState<string | null>(null)
  const [myRank, setMyRank] = useState<number | null>(null)
  const [myRow, setMyRow] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    const {
      data: { session },
    } = await getSession()
    const uid = session?.user.id ?? null
    setMyId(uid)

    const { data: top, error: topErr } = await supabase
      .from('profiles')
      .select('id, username, elo_rating, total_wins, total_losses')
      .order('elo_rating', { ascending: false })
      .limit(50)

    if (topErr) {
      setError(topErr.message)
      setLoading(false)
      return
    }

    setRows(top ?? [])

    if (uid) {
      const inTop = top?.some((p) => p.id === uid)
      if (!inTop) {
        const { data: me } = await supabase
          .from('profiles')
          .select('id, username, elo_rating, total_wins, total_losses')
          .eq('id', uid)
          .maybeSingle()

        if (me) {
          setMyRow(me)
          const { count, error: cErr } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gt('elo_rating', me.elo_rating)

          if (!cErr && count !== null) {
            setMyRank(count + 1)
          } else {
            setMyRank(null)
          }
        }
      } else {
        setMyRow(null)
        setMyRank(null)
      }
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(id)
  }, [load])

  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange(() => {
      window.setTimeout(() => void load(), 0)
    })
    return () => subscription.unsubscribe()
  }, [load])

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">Loading leaderboard…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-1 flex-col gap-6 bg-zinc-50 px-4 py-10 dark:bg-black">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Leaderboard</h1>
        <div className="flex gap-4 text-sm">
          <Link href="/lobby" className="font-medium text-emerald-700 underline dark:text-emerald-400">
            Lobby
          </Link>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-zinc-600 underline dark:text-zinc-400"
          >
            Home
          </button>
        </div>
      </header>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/80">
              <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Rank</th>
              <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Username</th>
              <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Elo</th>
              <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Wins</th>
              <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Losses</th>
              <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Win rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr
                key={p.id}
                className={
                  myId && p.id === myId
                    ? 'bg-emerald-50 dark:bg-emerald-950/40'
                    : 'border-t border-zinc-100 dark:border-zinc-800'
                }
              >
                <td className="px-3 py-2 text-zinc-800 dark:text-zinc-200">{i + 1}</td>
                <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-50">{p.username}</td>
                <td className="px-3 py-2">{p.elo_rating}</td>
                <td className="px-3 py-2">{p.total_wins}</td>
                <td className="px-3 py-2">{p.total_losses}</td>
                <td className="px-3 py-2">{winRate(p.total_wins, p.total_losses)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {myId && myRow && myRank !== null ? (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Your rank</h2>
          <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
            You are #{myRank} with {myRow.elo_rating} Elo ({myRow.username}) — outside the top 50.
          </p>
        </section>
      ) : null}
    </div>
  )
}
