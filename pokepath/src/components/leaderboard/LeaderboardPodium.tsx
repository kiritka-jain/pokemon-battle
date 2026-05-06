'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

export type PodiumProfile = {
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

function PodiumCard({
  place,
  profile,
  tall,
}: {
  place: 1 | 2 | 3
  profile: PodiumProfile | undefined
  tall?: boolean
}) {
  const border =
    place === 1
      ? 'border-amber-400/70 bg-amber-50/50 shadow-md dark:border-amber-500/40 dark:bg-amber-950/25'
      : place === 2
        ? 'border-zinc-300/80 bg-zinc-100/40 dark:border-zinc-600/60 dark:bg-zinc-900/40'
        : 'border-amber-800/25 bg-orange-50/35 dark:border-amber-900/40 dark:bg-orange-950/20'

  const label = place === 1 ? '1st' : place === 2 ? '2nd' : '3rd'

  return (
    <div
      className={`flex min-h-0 flex-col justify-end rounded-xl border px-3 py-3 text-center ${border} ${
        tall ? 'min-h-[8.5rem] md:min-h-[10rem]' : 'min-h-[6.5rem] md:min-h-[7.5rem]'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      {profile ? (
        <>
          <p className="mt-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {profile.username}
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-zinc-800 dark:text-zinc-100">
            {profile.elo_rating}
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400"> Elo</span>
          </p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            {profile.total_wins}W · {profile.total_losses}L · {winRate(profile.total_wins, profile.total_losses)}
          </p>
        </>
      ) : (
        <p className="mt-4 text-sm text-zinc-400 dark:text-zinc-500">—</p>
      )}
    </div>
  )
}

export function LeaderboardPodium({ podium }: { podium: PodiumProfile[] }) {
  const reduceMotion = useReducedMotion()
  const [first, second, third] = [podium[0], podium[1], podium[2]]

  if (podium.length === 0) return null

  const wrapMotion = (key: string, node: ReactNode, wrapperClass: string) => (
    <motion.div
      key={key}
      className={wrapperClass}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        delay: key === '1' ? 0.08 : key === '2' ? 0 : 0.16,
      }}
    >
      {node}
    </motion.div>
  )

  if (podium.length === 1) {
    return (
      <div className="mb-6 flex justify-center">
        {wrapMotion('1', <PodiumCard place={1} profile={first} tall />, 'w-full max-w-xs')}
      </div>
    )
  }

  if (podium.length === 2) {
    return (
      <div className="mb-6 flex items-end justify-center gap-3 md:gap-4">
        {wrapMotion('2', <PodiumCard place={2} profile={second} />, 'min-w-0 flex-1')}
        {wrapMotion('1', <PodiumCard place={1} profile={first} tall />, 'min-w-0 flex-1')}
      </div>
    )
  }

  return (
    <div className="mb-6 grid grid-cols-3 gap-2 md:gap-4">
      {wrapMotion('2', <PodiumCard place={2} profile={second} />, 'min-w-0')}
      {wrapMotion('1', <PodiumCard place={1} profile={first} tall />, 'min-w-0')}
      {wrapMotion('3', <PodiumCard place={3} profile={third} />, 'min-w-0')}
    </div>
  )
}
