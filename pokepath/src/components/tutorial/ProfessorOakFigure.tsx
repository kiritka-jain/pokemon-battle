import Image from 'next/image'

/** Fills the tutorial page’s left column (~⅓ width on md+) beside the rules carousel. */
export function ProfessorOakFigure() {
  return (
    <figure className="flex w-full max-w-[14rem] shrink-0 flex-col items-stretch justify-end md:max-w-none md:justify-center">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/40 shadow-md dark:border-zinc-700 dark:bg-zinc-900/60 scale-x-[-1]">
        <Image
          src="/tutorial/professor-oak.png"
          alt="Professor Oak explains the rules"
          fill
          className="object-cover object-[center_15%]"
          sizes="(max-width: 768px) min(90vw, 14rem), 33vw"
          priority
        />
      </div>
      <figcaption className="mt-2 w-full text-center text-xs text-zinc-500 dark:text-zinc-400">
        Professor Oak
      </figcaption>
    </figure>
  )
}
