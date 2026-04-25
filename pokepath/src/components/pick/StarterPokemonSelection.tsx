'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useCallback, useMemo, useState } from 'react'

import type { PartnerPickPayload } from '@/src/lib/pokemon/partnerPickStorage'
import { sampleThreeFromRoster } from '@/src/lib/pokemon/sampleThreeFromRoster'
import type { StarterSpecies } from '@/src/lib/pokemon/starterRoster'
import { STARTER_SPECIES } from '@/src/lib/pokemon/starterRoster'

export type StarterPokemonSelectionProps = {
  username: string
  onChooseRules: (payload: PartnerPickPayload) => void
  onChoosePlay: (payload: PartnerPickPayload) => void
}

export function StarterPokemonSelection({
  username,
  onChooseRules,
  onChoosePlay,
}: StarterPokemonSelectionProps) {
  const offer = useMemo(() => sampleThreeFromRoster(STARTER_SPECIES), [])

  const [opened, setOpened] = useState<[boolean, boolean, boolean]>([false, false, false])
  const [team, setTeam] = useState<[StarterSpecies | null, StarterSpecies | null]>([null, null])
  const [openOrder, setOpenOrder] = useState<number[]>([])

  const opensUsed = opened.filter(Boolean).length
  const canOpenMore = opensUsed < 2
  const rosterFull = team[0] !== null && team[1] !== null

  const handleBallClick = useCallback(
    (index: number) => {
      if (opened[index]) return
      if (!canOpenMore) return

      const species = offer[index]
      if (!species) return

      setOpened((prev) => {
        const next: [boolean, boolean, boolean] = [...prev]
        next[index] = true
        return next
      })

      setOpenOrder((prev) => [...prev, index])

      setTeam((prev) => {
        const [a, b] = prev
        if (!a) return [species, b]
        if (!b) return [a, species]
        return prev
      })
    },
    [canOpenMore, offer, opened],
  )

  const buildPayload = useCallback((): PartnerPickPayload | null => {
    const a = team[0]
    const b = team[1]
    if (!a || !b) return null
    const i0 = openOrder[0]
    const i1 = openOrder[1]
    if (i0 === undefined || i1 === undefined) return null

    return {
      speciesIds: [a.id, b.id],
      pickedAt: Date.now(),
      openedBallIndices: [i0, i1],
    }
  }, [openOrder, team])

  const handleChooseRules = useCallback(() => {
    const payload = buildPayload()
    if (!payload) return
    onChooseRules(payload)
  }, [buildPayload, onChooseRules])

  const handleChoosePlay = useCallback(() => {
    const payload = buildPayload()
    if (!payload) return
    onChoosePlay(payload)
  }, [buildPayload, onChoosePlay])

  return (
    <div className="relative min-h-full overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-50">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(220,38,38,0.14),_transparent_55%)]"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-full max-w-lg flex-col px-5 pb-12 pt-12 sm:max-w-2xl">
        <header className="text-center">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
              PokéPath
            </span>
            ,{' '}
            <span className="font-bold text-white underline decoration-red-500/70 decoration-2 underline-offset-4">
              {username}
            </span>
          </h1>
          <p className="mt-3 text-sm text-zinc-400 sm:text-base">Choose your Starter Pokémon.</p>
        </header>

        <section className="mt-10 flex flex-1 flex-col">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            The arena
          </p>

          <div className="flex items-center justify-center gap-4 sm:gap-8">
            {[0, 1, 2].map((i) => (
              <PokeBallButton
                key={offer[i]?.id ?? i}
                index={i}
                species={offer[i]}
                opened={opened[i] ?? false}
                disabled={!opened[i] && !canOpenMore}
                onOpen={() => handleBallClick(i)}
              />
            ))}
          </div>

          <div className="mt-14">
            <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Your team
            </p>

            <div className="flex justify-center gap-6">
              <TeamSlot label="Partner 1" species={team[0]} />
              <TeamSlot label="Partner 2" species={team[1]} />
            </div>
          </div>
        </section>

        <AnimatePresence>
          {rosterFull && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="mt-10 flex justify-center"
            >
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleChooseRules}
                  className="inline-flex min-h-12 min-w-[220px] items-center justify-center rounded-full border border-yellow-300/40 bg-yellow-200/10 px-8 text-sm font-semibold text-yellow-100 shadow-lg shadow-yellow-900/20 transition hover:bg-yellow-200/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300/40"
                >
                  Know the Rules?
                </button>
                <button
                  type="button"
                  onClick={handleChoosePlay}
                  className="inline-flex min-h-12 min-w-[220px] items-center justify-center rounded-full bg-red-600 px-8 text-sm font-semibold text-white shadow-lg shadow-red-900/40 ring-2 ring-red-400/30 transition hover:bg-red-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400/50"
                >
                  Ready to Play?
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-8 text-center text-[11px] text-zinc-600">
          Open two Pokéballs. The third stays sealed.
        </p>
      </div>
    </div>
  )
}

function PokeBallButton({
  index,
  species,
  opened,
  disabled,
  onOpen,
}: {
  index: number
  species: StarterSpecies | undefined
  opened: boolean
  disabled: boolean
  onOpen: () => void
}) {
  const label =
    opened && species
      ? `${species.displayName} revealed`
      : disabled
        ? `Pokéball ${index + 1} sealed`
        : `Open Pokéball ${index + 1}`

  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled && !opened}
      onClick={onOpen}
      whileHover={disabled || opened ? undefined : { scale: 1.06, y: -2 }}
      whileTap={disabled || opened ? undefined : { scale: 0.94 }}
      className={`relative flex h-28 w-28 flex-col items-center justify-center rounded-full sm:h-32 sm:w-32 ${
        disabled && !opened ? 'cursor-not-allowed opacity-40' : 'cursor-pointer opacity-100'
      }`}
    >
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="closed"
            initial={false}
            exit={{ opacity: 0, scale: 0.85, filter: 'blur(6px)' }}
            transition={{ duration: 0.25 }}
          >
            <PokeBallSvg className="h-28 w-28 drop-shadow-xl sm:h-32 sm:w-32" />
          </motion.div>
        ) : species ? (
          <motion.div
            key="open"
            initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            className="flex h-28 w-28 flex-col items-center justify-center rounded-2xl border border-red-500/40 bg-zinc-950/90 p-3 shadow-xl shadow-black/50 ring-2 ring-red-500/25 sm:h-32 sm:w-32"
          >
            <SpeciesVisual
              species={species}
              size="ball"
              motionProps={{
                initial: { scale: 0 },
                animate: { scale: 1 },
                transition: { delay: 0.08, type: 'spring' as const, stiffness: 400, damping: 18 },
              }}
            />
            <span className="mt-2 text-center text-[11px] font-semibold leading-tight text-white">
              {species.displayName}
            </span>
            <span className="mt-0.5 text-center text-[10px] font-medium text-red-300/90">
              {species.typeLabel}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {opened && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none absolute inset-0 rounded-full bg-white/25"
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function TeamSlot({ label, species }: { label: string; species: StarterSpecies | null }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        layout
        className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-zinc-600 bg-zinc-950/60 sm:h-24 sm:w-24"
      >
        <AnimatePresence mode="wait">
          {species ? (
            <motion.div
              key={species.id}
              initial={{ opacity: 0, y: 10, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className="flex flex-col items-center"
            >
              <SpeciesVisual species={species} size="roster" />
            </motion.div>
          ) : (
            <motion.span
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-medium text-zinc-600"
            >
              Empty
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{label}</span>
    </div>
  )
}

function SpeciesVisual({
  species,
  size,
  motionProps,
}: {
  species: StarterSpecies
  size: 'ball' | 'roster'
  motionProps?: {
    initial: { scale: number }
    animate: { scale: number }
    transition: { delay?: number; type: 'spring'; stiffness: number; damping: number }
  }
}) {
  const dim = size === 'ball' ? 64 : 48
  const className =
    size === 'ball' ? 'h-16 w-16 object-contain' : 'h-12 w-12 object-contain'

  if (species.imageSrc) {
    const img = (
      <div
        className="rounded-lg bg-zinc-900/35 p-0.5 ring-1 ring-zinc-700/30"
      >
        <Image
          src={species.imageSrc}
          alt={species.displayName}
          width={dim}
          height={dim}
          className={className}
          sizes={`${dim}px`}
          priority={size === 'ball'}
        />
      </div>
    )
    if (motionProps) {
      return (
        <motion.div
          initial={motionProps.initial}
          animate={motionProps.animate}
          transition={motionProps.transition}
          className="flex items-center justify-center"
        >
          {img}
        </motion.div>
      )
    }
    return <div className="flex items-center justify-center">{img}</div>
  }

  if (motionProps) {
    return (
      <motion.span
        initial={motionProps.initial}
        animate={motionProps.animate}
        transition={motionProps.transition}
        className={size === 'ball' ? 'text-5xl' : 'text-4xl'}
        aria-hidden
      >
        {species.emoji}
      </motion.span>
    )
  }
  return (
    <span className={size === 'ball' ? 'text-5xl' : 'text-4xl'} aria-hidden>
      {species.emoji}
    </span>
  )
}

function PokeBallSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="48" fill="#f4f4f5" stroke="#18181b" strokeWidth="4" />
      <path d="M2 50 H98" stroke="#18181b" strokeWidth="4" />
      <circle cx="50" cy="50" r="14" fill="#fafafa" stroke="#18181b" strokeWidth="4" />
      <path d="M2 50 A48 48 0 0 1 98 50 Z" fill="#dc2626" />
      <circle cx="50" cy="50" r="6" fill="#18181b" />
    </svg>
  )
}
