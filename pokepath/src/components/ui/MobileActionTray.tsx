'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useGameStore } from '@/src/lib/store/gameStore'
import { getConfirmActionLabel } from '@/src/lib/ui/pendingActionLabels'

const TRAY_ERROR_MS = 3000

export function MobileActionTray() {
  const pendingAction = useGameStore((s) => s.pendingAction)
  const clearPendingAction = useGameStore((s) => s.clearPendingAction)
  const [trayError, setTrayError] = useState<string | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearHideTimer()
  }, [clearHideTimer])

  const commitAction = useCallback(() => {
    useGameStore.getState().commitAction()
    const err = useGameStore.getState().error
    if (err) {
      setTrayError(err)
      clearHideTimer()
      hideTimerRef.current = setTimeout(() => {
        setTrayError(null)
        hideTimerRef.current = null
      }, TRAY_ERROR_MS)
    } else {
      clearHideTimer()
      setTrayError(null)
    }
  }, [clearHideTimer])

  const onCancel = useCallback(() => {
    clearHideTimer()
    setTrayError(null)
    clearPendingAction()
  }, [clearHideTimer, clearPendingAction])

  const disabled = pendingAction.type === null

  return (
    <div
      className="fixed bottom-0 left-0 z-50 w-full border-t border-zinc-200 bg-white/95 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95"
      role="region"
      aria-label="Pending action"
    >
      <div className="mx-auto flex max-w-lg flex-col gap-2 px-4">
        <div className="flex gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={onCancel}
            className="flex-1 rounded-lg border border-zinc-400 px-4 py-3 text-sm font-medium text-zinc-800 shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={commitAction}
            className="flex-1 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-medium text-white shadow transition-opacity disabled:cursor-not-allowed disabled:opacity-40 dark:bg-emerald-600"
          >
            {getConfirmActionLabel(pendingAction)}
          </button>
        </div>
        {trayError ? (
          <p
            className="text-center text-sm text-red-600 transition-opacity duration-300 dark:text-red-400"
            role="alert"
            aria-live="polite"
          >
            {trayError}
          </p>
        ) : null}
      </div>
    </div>
  )
}
