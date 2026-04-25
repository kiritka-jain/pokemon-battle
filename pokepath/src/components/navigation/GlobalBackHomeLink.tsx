'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { leaveConfirmationMessage } from '@/src/lib/navigation/leavePageMessages'
import { useGameStore } from '@/src/lib/store/gameStore'

export function GlobalBackHomeLink() {
  const router = useRouter()
  const pathname = usePathname()
  const gameStatus = useGameStore((s) => s.status)
  const winner = useGameStore((s) => s.winner)
  const [hasHistory, setHasHistory] = useState(false)

  useEffect(() => {
    setHasHistory(window.history.length > 1)
  }, [])

  const label = hasHistory ? 'Back' : 'Home'

  const confirmMessage = useMemo(
    () => leaveConfirmationMessage(pathname, { status: gameStatus, winner }),
    [gameStatus, pathname, winner],
  )

  const onNavigate = useCallback(() => {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return
    }

    if (hasHistory) {
      router.back()
      return
    }

    router.push('/')
  }, [confirmMessage, hasHistory, router])

  return (
    <button
      type="button"
      onClick={onNavigate}
      className="fixed left-[max(0.75rem,env(safe-area-inset-left))] top-[max(0.75rem,env(safe-area-inset-top))] z-40 rounded-full border border-zinc-300/90 bg-white/90 px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur transition-colors hover:bg-zinc-100 dark:border-zinc-700/90 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:bg-zinc-800"
      aria-label={label === 'Back' ? 'Go back' : 'Go home'}
    >
      {label}
    </button>
  )
}
