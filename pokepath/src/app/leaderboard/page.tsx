'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { LeaderboardPodium } from '@/src/components/leaderboard/LeaderboardPodium'
import { HomePokemonBackdrop } from '@/src/components/home/HomePokemonBackdrop'
import { outsideTop50Milestone } from '@/src/lib/leaderboard/outsideTop50Milestone'
import { splitLeaderboardRows } from '@/src/lib/leaderboard/splitLeaderboardRows'
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

function LeaderboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-gradient-to-b from-amber-50 via-zinc-50 to-emerald-50 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <HomePokemonBackdrop />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-amber-50/40 via-zinc-50/38 to-emerald-50/42 dark:from-zinc-950/48 dark:via-black/40 dark:to-zinc-900/48"
        aria-hidden
      />
      {children}
    </div>
  )
}

const glassPanelClass =
  'relative z-10 w-full max-w-4xl rounded-2xl border border-white/30 bg-white/[0.11] p-6 shadow-[0_6px_28px_rgba(0,0,0,0.04)] backdrop-blur-sm backdrop-saturate-150 dark:border-white/[0.08] dark:bg-zinc-950/[0.14] dark:shadow-[0_6px_28px_rgba(0,0,0,0.25)] md:p-8'

function LoadingSkeleton() {
  return (
    <LeaderboardShell>
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10">
        <div className={glassPanelClass}>
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between gap-4">
              <div className="h-8 w-40 rounded-lg bg-zinc-200/80 dark:bg-zinc-700/60" />
              <div className="h-5 w-28 rounded bg-zinc-200/80 dark:bg-zinc-700/60" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-28 rounded-xl bg-zinc-200/70 dark:bg-zinc-700/50" />
              <div className="h-36 rounded-xl bg-zinc-200/80 dark:bg-zinc-700/60" />
              <div className="h-28 rounded-xl bg-zinc-200/70 dark:bg-zinc-700/50" />
            </div>
            <div className="space-y-2 rounded-xl border border-zinc-200/50 bg-white/30 p-3 dark:border-zinc-700/50 dark:bg-zinc-900/20">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 rounded-md bg-zinc-200/60 dark:bg-zinc-700/40" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </LeaderboardShell>
  )
}

export default function LeaderboardPage() {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
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
        } else {
          setMyRow(null)
          setMyRank(null)
        }
      } else {
        setMyRow(null)
        setMyRank(null)
      }
    } else {
      setMyRow(null)
      setMyRank(null)
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

  const { podium, rest } = useMemo(() => splitLeaderboardRows(rows), [rows])

  const myRankInTopList = useMemo(() => {
    if (!myId || rows.length === 0) return null
    const idx = rows.findIndex((p) => p.id === myId)
    if (idx < 0) return null
    return idx + 1
  }, [myId, rows])

  const milestone = useMemo(() => {
    if (!myRow || myRank === null) return null
    return outsideTop50Milestone(rows, myRow.elo_rating)
  }, [myRow, myRank, rows])

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <LeaderboardShell>
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10">
        <motion.div
          className={glassPanelClass}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Leaderboard</h1>
            <div className="flex gap-4 text-sm">
              <Link
                href="/lobby"
                className="font-medium text-emerald-700 underline dark:text-emerald-400"
              >
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
            <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          {!error && rows.length === 0 ? (
            <div className="mt-8 rounded-xl border border-zinc-200/60 bg-white/40 px-4 py-8 text-center dark:border-zinc-700/60 dark:bg-zinc-900/30">
              <p className="text-zinc-700 dark:text-zinc-300">No trainers on the board yet.</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Play a ranked match to appear here.
              </p>
              <Link
                href="/lobby"
                className="mt-4 inline-block text-sm font-medium text-emerald-700 underline dark:text-emerald-400"
              >
                Go to lobby
              </Link>
            </div>
          ) : null}

          {!error && rows.length > 0 ? (
            <>
              <LeaderboardPodium podium={podium} />

              {myRankInTopList !== null && myId ? (
                <div className="sticky top-0 z-20 -mx-2 mb-3 border-b border-zinc-200/50 bg-white/55 px-2 py-2 backdrop-blur-md dark:border-zinc-700/50 dark:bg-zinc-950/55">
                  <p className="text-center text-sm font-medium text-emerald-900 dark:text-emerald-200">
                    You · #{myRankInTopList} ·{' '}
                    {rows.find((p) => p.id === myId)?.elo_rating ?? '—'} Elo
                  </p>
                </div>
              ) : null}

              <div className="hidden md:block">
                <div className="overflow-x-auto rounded-xl border border-zinc-200/60 bg-white/30 dark:border-zinc-700/60 dark:bg-zinc-900/25">
                  <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/80">
                        <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                          Rank
                        </th>
                        <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                          Username
                        </th>
                        <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Elo</th>
                        <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Wins</th>
                        <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                          Losses
                        </th>
                        <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                          Win rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rest.map((p, i) => {
                        const rank = i + 4
                        const isMe = myId && p.id === myId
                        return (
                          <tr
                            key={p.id}
                            className={
                              isMe
                                ? 'bg-emerald-50 dark:bg-emerald-950/40'
                                : 'border-t border-zinc-100 dark:border-zinc-800'
                            }
                          >
                            <td className="px-3 py-2 text-zinc-800 dark:text-zinc-200">{rank}</td>
                            <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-50">
                              {p.username}
                            </td>
                            <td className="px-3 py-2 tabular-nums">{p.elo_rating}</td>
                            <td className="px-3 py-2 tabular-nums">{p.total_wins}</td>
                            <td className="px-3 py-2 tabular-nums">{p.total_losses}</td>
                            <td className="px-3 py-2">{winRate(p.total_wins, p.total_losses)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <ul className="flex flex-col gap-2 md:hidden">
                {rest.map((p, i) => {
                  const rank = i + 4
                  const isMe = myId && p.id === myId
                  return (
                    <li
                      key={p.id}
                      className={`rounded-xl border px-3 py-3 text-sm ${
                        isMe
                          ? 'border-emerald-300/70 bg-emerald-50/70 dark:border-emerald-800/50 dark:bg-emerald-950/35'
                          : 'border-zinc-200/60 bg-white/35 dark:border-zinc-700/60 dark:bg-zinc-900/30'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                          #{rank}{' '}
                          <span className="font-medium">{p.username}</span>
                        </span>
                        <span className="shrink-0 tabular-nums font-bold text-zinc-800 dark:text-zinc-100">
                          {p.elo_rating} Elo
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {p.total_wins}W · {p.total_losses}L · {winRate(p.total_wins, p.total_losses)}{' '}
                        win rate
                      </p>
                    </li>
                  )
                })}
              </ul>

              {rest.length === 0 && rows.length > 0 ? (
                <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                  Ranks 4 and up will show here as more trainers join.
                </p>
              ) : null}
            </>
          ) : null}

          {myId && myRow && myRank !== null ? (
            <section className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Your rank</h2>
              <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
                You are #{myRank} with {myRow.elo_rating} Elo ({myRow.username}) — outside the top 50.
              </p>
              {milestone ? (
                <p className="mt-2 text-sm text-emerald-800/90 dark:text-emerald-200/90">
                  {milestone.type === 'pool_under_50' ? (
                    <>
                      Only {milestone.playerCount} trainer{milestone.playerCount === 1 ? '' : 's'} on
                      the board so far — climb as more players join.
                    </>
                  ) : (
                    <>
                      Rank 50 is at {milestone.rank50Elo} Elo
                      {milestone.eloBehind > 0
                        ? ` — you’re ${milestone.eloBehind} Elo behind the cutoff.`
                        : ' — you’re at the cutoff Elo; keep playing to break into the list.'}
                    </>
                  )}
                </p>
              ) : null}
            </section>
          ) : null}
        </motion.div>
      </div>
    </LeaderboardShell>
  )
}
