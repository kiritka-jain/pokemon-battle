'use client'

type VictoryModalProps = {
  open: boolean
  title: string
  subtitle?: string
  primaryLabel?: string
  onPrimary: () => void
}

export function VictoryModal({
  open,
  title,
  subtitle,
  primaryLabel = 'Back to lobby',
  onPrimary,
}: VictoryModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <h2 id="victory-title" className="text-center text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        ) : null}
        <button
          type="button"
          onClick={onPrimary}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-emerald-700 text-sm font-medium text-white dark:bg-emerald-600"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  )
}
