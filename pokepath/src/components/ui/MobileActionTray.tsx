'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { pickTurnSnapshot } from '@/src/lib/match/snapshotUtils'
import { useGameStore } from '@/src/lib/store/gameStore'
import type { GameState, PendingAction, PlayerKey } from '@/src/types/game'
import { getConfirmActionLabel } from '@/src/lib/ui/pendingActionLabels'
import { TRAP_OPPONENT_TOAST_MESSAGE } from '@/src/lib/ui/trapFenceToast'
import { useToast } from '@/src/components/ui/toast'

const TRAY_ERROR_MS = 3000

export type MobileActionTrayProps = {
  /** Authenticated user id (online) or current seat id for local dev; must match `players[turn].id` unless match is local-dev. */
  actingUserId: string
  afterSuccessfulCommit?: (ctx: {
    /** Board before `commitAction` (rollback target if persistence fails). */
    preCommitSnapshot: Pick<
      GameState,
      'turn' | 'players' | 'fences' | 'winner' | 'status' | 'pendingAction' | 'arena'
    >
    committedAction: PendingAction
    /** Seat that committed before `turn` advanced (ticket 3.3). */
    previousTurn: PlayerKey
    snapshot: Pick<
      GameState,
      'turn' | 'players' | 'fences' | 'winner' | 'status' | 'pendingAction' | 'arena'
    >
  }) => void | Promise<void>
}

export function MobileActionTray(props: MobileActionTrayProps) {
  const { actingUserId, afterSuccessfulCommit } = props
  const { show: showToast } = useToast()
  const pendingAction = useGameStore((s) => s.pendingAction)
  const clearPendingAction = useGameStore((s) => s.clearPendingAction)
  const clearCommitErrorCode = useGameStore((s) => s.clearCommitErrorCode)
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
    const pendingBefore = useGameStore.getState().pendingAction
    const previousTurn = useGameStore.getState().turn
    const preCommitSnapshot = pickTurnSnapshot(useGameStore.getState())
    useGameStore.getState().commitAction({ actingUserId })
    const errCode = useGameStore.getState().errorCode
    if (errCode === 'TRAP_OPPONENT') {
      showToast({ message: TRAP_OPPONENT_TOAST_MESSAGE, variant: 'error' })
      clearCommitErrorCode()
    }
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
      if (pendingBefore.type !== null) {
        // Use an immutable board snapshot; live store references can drift before API compare.
        const snapshot = pickTurnSnapshot(useGameStore.getState())
        void (async () => {
          if (!afterSuccessfulCommit) return
          try {
            await Promise.resolve(
              afterSuccessfulCommit({
                preCommitSnapshot,
                committedAction: pendingBefore,
                previousTurn,
                snapshot,
              }),
            )
          } catch {
            useGameStore.getState().restoreTurnSnapshot(preCommitSnapshot)
            showToast({ message: 'Move not saved — try again.', variant: 'error' })
          }
        })()
      }
    }
  }, [actingUserId, afterSuccessfulCommit, clearCommitErrorCode, clearHideTimer, showToast])

  const onCancel = useCallback(() => {
    clearHideTimer()
    setTrayError(null)
    clearPendingAction()
  }, [clearHideTimer, clearPendingAction])

  const disabled = pendingAction.type === null

  /* Tray: z-50 above board overlays (FenceSlotGrid z-[25]); keep below modals (e.g. z-[100]). */
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 w-full border-t border-zinc-200 bg-white/95 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/95"
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
