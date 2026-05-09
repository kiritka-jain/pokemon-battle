'use client'

import Image from 'next/image'
import { useCallback, useRef, useState, type TouchEvent } from 'react'

import { GAME_RULE_SLIDES } from '@/src/lib/tutorial/gameRules'

const SWIPE_PX = 56

const LIVE_REGION_ID = 'rules-slide-live'

export function RulesCloudDeck() {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const n = GAME_RULE_SLIDES.length
  const slide = GAME_RULE_SLIDES[index]!

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => Math.max(0, Math.min(n - 1, i + dir)))
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

  const hasImage = Boolean(slide.imageSrc)

  return (
    <div className="flex w-full min-w-0 flex-col items-center">
      <p className="mb-2 text-center text-xs text-zinc-500 dark:text-zinc-400 md:hidden">
        Swipe the card left or right for the next rule
      </p>
      <p className="mb-2 hidden text-center text-xs text-zinc-500 dark:text-zinc-400 md:block">
        Use the arrows or dot indicators to change rules
      </p>

      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Game rules"
        className="relative w-full max-w-2xl"
      >
        <div
          className="relative mx-auto w-full max-w-xl cursor-grab touch-pan-y active:cursor-grabbing"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            id={LIVE_REGION_ID}
            aria-live="polite"
            className="min-h-[240px] rounded-2xl border border-yellow-200/90 bg-white/95 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/95 sm:min-h-[260px] sm:p-5 md:min-h-[220px]"
          >
            <div
              className={
                hasImage
                  ? 'flex flex-col gap-4 md:flex-row md:items-center md:gap-6'
                  : 'flex flex-col items-center text-center'
              }
            >
              {slide.imageSrc ? (
                <div className="relative mx-auto flex w-full shrink-0 justify-center md:mx-0 md:w-[45%]">
                  <Image
                    src={slide.imageSrc}
                    alt={slide.imageAlt ?? ''}
                    width={400}
                    height={280}
                    sizes="(max-width: 768px) 85vw, 320px"
                    className="max-h-[240px] w-auto max-w-full rounded-xl border border-zinc-200 object-contain dark:border-zinc-600 sm:max-h-[260px]"
                  />
                </div>
              ) : null}

              <div
                className={`flex min-w-0 flex-1 flex-col justify-center leading-snug text-zinc-800 dark:text-zinc-100 ${
                  hasImage ? 'text-left md:w-[55%]' : 'max-w-md px-1 text-center'
                }`}
              >
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 sm:text-xl">
                  {slide.title}
                </h2>
                <p className="mt-2 text-base font-medium leading-snug sm:text-lg">{slide.body}</p>
                {slide.caption ? (
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">{slide.caption}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-center gap-3">
          {index > 0 ? (
            <button
              type="button"
              aria-controls={LIVE_REGION_ID}
              className="rounded-full border border-sky-300/80 bg-white/90 px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-sky-50 dark:border-zinc-600 dark:bg-zinc-900/90 dark:text-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => go(-1)}
            >
              Previous
            </button>
          ) : null}
          {index < n - 1 ? (
            <button
              type="button"
              aria-controls={LIVE_REGION_ID}
              className="rounded-full border border-sky-300/80 bg-white/90 px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-sky-50 dark:border-zinc-600 dark:bg-zinc-900/90 dark:text-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => go(1)}
            >
              Next
            </button>
          ) : null}
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
