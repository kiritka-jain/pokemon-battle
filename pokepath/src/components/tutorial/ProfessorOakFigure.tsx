import Image from 'next/image'

/** Viewport-aware width so Oak scales with screen; shared by frame + caption. */
const oakWidthClass =
  'w-[min(92vw,24rem)] sm:w-[min(90vw,26rem)] md:w-[min(45vw,32rem)] lg:w-[min(40vw,36rem)]'

export function ProfessorOakFigure() {
  return (
    <figure className="flex w-full shrink-0 flex-col items-center justify-end md:w-auto md:justify-center">
      <div
        className={`relative aspect-[4/3] ${oakWidthClass} overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/40 shadow-md dark:border-zinc-700 dark:bg-zinc-900/60 scale-x-[-1]`}
      >
        <Image
          src="/tutorial/professor-oak.png"
          alt="Professor Oak explains the rules"
          fill
          className="object-cover object-[center_15%]"
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 576px"
          priority
        />
      </div>
      <figcaption className={`mt-2 ${oakWidthClass} text-center text-xs text-zinc-500 dark:text-zinc-400`}>
        Professor Oak
      </figcaption>
    </figure>
  )
}
