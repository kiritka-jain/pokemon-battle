import Image from 'next/image'

export function ProfessorOakFigure() {
  return (
    <figure className="flex shrink-0 flex-col items-center justify-end md:justify-center">
      <div className="relative aspect-[4/3] w-full max-w-[280px] overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/40 shadow-md dark:border-zinc-700 dark:bg-zinc-900/60 md:max-w-[min(100%,340px)]">
        <Image
          src="/tutorial/professor-oak.png"
          alt="Professor Oak explains the rules"
          fill
          className="object-cover object-[center_15%]"
          sizes="(max-width: 768px) 280px, 340px"
          priority
        />
      </div>
      <figcaption className="mt-2 max-w-[280px] text-center text-xs text-zinc-500 dark:text-zinc-400 md:max-w-[340px]">
        Professor Oak
      </figcaption>
    </figure>
  )
}
