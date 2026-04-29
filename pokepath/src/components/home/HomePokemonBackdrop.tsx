'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Decorative watermark sprites only — empty alt; container aria-hidden.
 * Togepi asset: `public/pokemon/togepi.png` (PokeAPI official artwork).
 */
const SPRITES = [
  {
    src: '/pokemon/pikachu.png',
    invertBob: false,
    delay: 0,
    position:
      'top-[4%] left-[max(0.25rem,env(safe-area-inset-left))] sm:top-[6%] sm:left-[4%] md:left-[6%]',
    size: 'h-[min(22vw,5.5rem)] w-[min(22vw,5.5rem)] sm:h-28 sm:w-28 md:h-[8.5rem] md:w-[8.5rem]',
  },
  {
    src: '/pokemon/togepi.png',
    invertBob: true,
    delay: 0.4,
    position:
      'top-[8%] right-[max(0.25rem,env(safe-area-inset-right))] sm:top-[10%] sm:right-[5%]',
    size: 'h-[min(20vw,5rem)] w-[min(20vw,5rem)] sm:h-24 sm:w-24 md:h-32 md:w-32',
  },
  {
    src: '/pokemon/charmander.png',
    invertBob: false,
    delay: 0.8,
    position:
      'top-[42%] left-[max(-0.5rem,env(safe-area-inset-left))] sm:top-[40%] sm:left-[2%] md:left-[4%]',
    size: 'h-[min(24vw,6rem)] w-[min(24vw,6rem)] sm:h-32 sm:w-32 md:h-36 md:w-36',
  },
  {
    src: '/pokemon/bulbasaur.png',
    invertBob: true,
    delay: 1.2,
    position:
      'bottom-[26%] left-[max(0.5rem,env(safe-area-inset-left))] sm:bottom-[22%] sm:left-[6%]',
    size: 'h-[min(21vw,5.25rem)] w-[min(21vw,5.25rem)] sm:h-[7rem] sm:w-[7rem] md:h-36 md:w-36',
  },
  {
    src: '/pokemon/squirtle.png',
    invertBob: false,
    delay: 1.6,
    position:
      'bottom-[20%] right-[max(0.5rem,env(safe-area-inset-right))] sm:bottom-[18%] sm:right-[6%]',
    size: 'h-[min(23vw,5.75rem)] w-[min(23vw,5.75rem)] sm:h-[7.25rem] sm:w-[7.25rem] md:h-40 md:w-40',
  },
] as const

export function HomePokemonBackdrop() {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {SPRITES.map((sprite) => (
        <motion.div
          key={sprite.src}
          className={`absolute ${sprite.position} ${sprite.size}`}
          initial={false}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: sprite.invertBob ? [0, 10, 0] : [0, -10, 0],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: sprite.delay,
                }
          }
        >
          <div className="relative h-full w-full opacity-[0.18] saturate-50 contrast-95 dark:opacity-[0.13] dark:saturate-[0.85]">
            <Image
              src={sprite.src}
              alt=""
              fill
              sizes="(max-width: 640px) 22vw, 160px"
              className="object-contain grayscale"
              priority={false}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
