'use client'

import { useCallback, useId, useRef, useState, type TouchEvent } from 'react'

import { GAME_RULE_SLIDES } from '@/src/lib/tutorial/gameRules'

const SWIPE_PX = 56

function CloudBackdrop({ shadowId }: { shadowId: string }) {
  return (
    <svg
      className="pointer-events-none absolute left-1/2 top-1/2 h-[min(100%,220px)] w-[min(100%,380px)] -translate-x-1/2 -translate-y-1/2 overflow-visible text-white drop-shadow-md dark:text-zinc-800/95"
      viewBox="0 0 380 200"
      aria-hidden
    >
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.12" />
        </filter>
      </defs>
      <path
        filter={`url(#${shadowId})`}
        fill="currentColor"
        stroke="rgb(125 211 252 / 0.45)"
        strokeWidth="1"
        className="dark:stroke-zinc-600"
        d="M 95 145 C 55 145 30 115 38 82 C 42 58 62 42 88 40 C 98 18 122 4 152 8 C 168 2 188 4 204 14 C 228 6 254 12 272 30 C 310 22 348 52 348 92 C 348 132 312 162 268 158 C 252 172 228 180 200 176 C 178 188 148 186 124 170 C 108 178 88 176 72 166 C 52 172 28 160 20 138 C 12 116 24 90 48 82 C 52 58 72 42 95 42 Z"
      />
    </svg>
  )
}

export function RulesCloudDeck() {
  const shadowFilterId = useId().replace(/:/g, '')
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const n = GAME_RULE_SLIDES.length
  const slide = GAME_RULE_SLIDES[index]!

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => {
        const next = i + dir
        if (next < 0) return n - 1
        if (next >= n) return 0
        return next
      })
    },
    [n],
  )

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStartX.current
    touchStartX.current = null
    if (start == null) return
    const end = e.changedTouches[0]?.clientX
    if (end == null) return
    const dx = end - start
    if (dx < -SWIPE_PX) go(1)
    else if (dx > SWIPE_PX) go(-1)
  }

  return (
    <div className="flex w-full min-w-0 flex-col items-center">
      <p className="mb-2 text-center text-xs text-zinc-500 dark:text-zinc-400 md:hidden">
        Swipe the cloud left or right for the next rule
      </p>
      <p className="mb-2 hidden text-center text-xs text-zinc-500 dark:text-zinc-400 md:block">
        Use the arrows or dot indicators to change rules
      </p>

      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Game rules"
        className="relative w-full max-w-md"
      >
        <div
          className="relative mx-auto flex min-h-[200px] w-full max-w-[22rem] cursor-grab touch-pan-y items-center justify-center px-6 py-10 active:cursor-grabbing md:max-w-[24rem]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <CloudBackdrop shadowId={shadowFilterId} />
          <div
            id="rules-cloud-text"
            aria-live="polite"
            className="relative z-10 max-w-[17.5rem] text-center leading-relaxed text-zinc-800 dark:text-zinc-100"
          >
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{slide.title}</h2>
            <p className="mt-2 text-sm font-medium sm:text-base">{slide.body}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
              {slide.takeaway}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-controls="rules-cloud-text"
            className="rounded-full border border-sky-300/80 bg-white/90 px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-sky-50 dark:border-zinc-600 dark:bg-zinc-900/90 dark:text-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => go(-1)}
          >
            Previous
          </button>
          <button
            type="button"
            aria-controls="rules-cloud-text"
            className="rounded-full border border-sky-300/80 bg-white/90 px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-sky-50 dark:border-zinc-600 dark:bg-zinc-900/90 dark:text-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => go(1)}
          >
            Next
          </button>
        </div>

        <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="Rule slides">
          {GAME_RULE_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Rule ${i + 1} of ${n}`}
              className={`h-2 w-2 rounded-full transition ${
                i === index ? 'bg-sky-600 dark:bg-sky-400' : 'bg-zinc-300 dark:bg-zinc-600'
              }`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
