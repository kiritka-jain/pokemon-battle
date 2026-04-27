'use client'

import Image from 'next/image'
import { useCallback, useState } from 'react'

import type { StarterSpecies } from '@/src/lib/pokemon/starterRoster'

export type PokemonSpeciesPickerModalProps = {
  open: boolean
  /** Two Pokemon from the same roster order as the team pick flow */
  options: [StarterSpecies, StarterSpecies]
  onConfirm: (speciesId: string) => void
}

export function PokemonSpeciesPickerModal({ open, options, onConfirm }: PokemonSpeciesPickerModalProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleConfirm = useCallback(() => {
    if (!selected) return
    onConfirm(selected)
  }, [onConfirm, selected])

  if (!open) return null

  const [a, b] = options

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="board-pokemon-picker-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-950 p-6 text-zinc-50 shadow-2xl">
        <h2 id="board-pokemon-picker-title" className="text-center text-lg font-semibold tracking-tight">
          Choose your board Pokemon
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Pick one Pokemon from your team to represent you on the route.
        </p>

        <div className="mt-8 flex justify-center gap-6">
          <PokemonOptionCard species={a} selected={selected === a.id} onSelect={() => setSelected(a.id)} />
          <PokemonOptionCard species={b} selected={selected === b.id} onSelect={() => setSelected(b.id)} />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            disabled={!selected}
            onClick={handleConfirm}
            className="inline-flex min-h-11 min-w-[180px] items-center justify-center rounded-full bg-red-600 px-6 text-sm font-semibold text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Use on board
          </button>
        </div>
      </div>
    </div>
  )
}

function PokemonOptionCard({
  species,
  selected,
  onSelect,
}: {
  species: StarterSpecies
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-36 flex-col items-center gap-2 rounded-xl border-2 p-3 transition ${
        selected
          ? 'border-red-500 bg-red-950/40 ring-2 ring-red-400/40'
          : 'border-zinc-700 bg-zinc-900/60 hover:border-zinc-500'
      }`}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-zinc-600 bg-zinc-950/80">
        {species.imageSrc ? (
          <Image
            src={species.imageSrc}
            alt={species.displayName}
            width={72}
            height={72}
            className="h-[72px] w-[72px] object-contain"
            sizes="72px"
          />
        ) : (
          <span className="text-4xl" aria-hidden>
            {species.emoji}
          </span>
        )}
      </div>
      <span className="text-center text-xs font-semibold leading-tight">{species.displayName}</span>
    </button>
  )
}
