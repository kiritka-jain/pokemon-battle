import Image from 'next/image'

/** Compact figure so rule cards stay visually dominant on the tutorial page. */
const oakWidthClass =
  'w-[min(56vw,11rem)] sm:w-[min(50vw,12rem)] md:w-[min(28vw,11rem)] lg:w-[min(22vw,12rem)]'

export function ProfessorOakFigure() {
  return (
    <figure className="flex w-full max-w-[12rem] shrink-0 flex-col items-center justify-end sm:max-w-[13rem] md:w-auto md:max-w-[11rem] md:justify-center lg:max-w-[12rem]">
      <div
        className={`relative aspect-[4/3] ${oakWidthClass} overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/40 shadow-md dark:border-zinc-700 dark:bg-zinc-900/60 scale-x-[-1]`}
      >
        <Image
          src="/tutorial/professor-oak.png"
          alt="Professor Oak explains the rules"
          fill
          className="object-cover object-[center_15%]"
          sizes="(max-width: 640px) 56vw, (max-width: 1024px) 28vw, 192px"
          priority
        />
      </div>
      <figcaption className={`mt-2 ${oakWidthClass} text-center text-xs text-zinc-500 dark:text-zinc-400`}>
        Professor Oak
      </figcaption>
    </figure>
  )
}
