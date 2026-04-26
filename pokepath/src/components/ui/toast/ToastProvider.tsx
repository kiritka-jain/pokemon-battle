'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react'

import {
  initialToastState,
  toastReducer,
  type ToastActionButton,
  type ToastVariant,
} from './toastReducer'

const TOAST_AUTO_DISMISS_MS = 4000

export type ShowToastOptions = {
  message: string
  variant?: ToastVariant
  primaryAction?: ToastActionButton
  secondaryAction?: ToastActionButton
}

type ToastContextValue = {
  show: (opts: ShowToastOptions) => void
  dismiss: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}

function toastVariantClasses(variant: ToastVariant): string {
  switch (variant) {
    case 'error':
      return 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/90 dark:text-red-100'
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-50'
    default:
      return 'border-zinc-200 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50'
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, initialToastState)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idRef = useRef(0)

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearHideTimer()
  }, [clearHideTimer])

  const dismiss = useCallback(() => {
    clearHideTimer()
    dispatch({ type: 'DISMISS' })
  }, [clearHideTimer])

  const show = useCallback(
    (opts: ShowToastOptions) => {
      clearHideTimer()
      idRef.current += 1
      const id = idRef.current
      const variant = opts.variant ?? 'default'
      dispatch({
        type: 'SHOW',
        id,
        message: opts.message,
        variant,
        primaryAction: opts.primaryAction,
        secondaryAction: opts.secondaryAction,
      })
      hideTimerRef.current = setTimeout(() => {
        dispatch({ type: 'DISMISS' })
        hideTimerRef.current = null
      }, TOAST_AUTO_DISMISS_MS)
    },
    [clearHideTimer]
  )

  const t = state.toast
  const secondaryAction = t?.secondaryAction
  const primaryAction = t?.primaryAction
  const onAction = useCallback(
    (action: ToastActionButton) => {
      dismiss()
      action.onClick()
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
        {t ? (
          <output
            className={`pointer-events-auto max-w-md rounded-lg border px-4 py-3 text-sm shadow-lg ${toastVariantClasses(t.variant)}`}
            role={t.variant === 'error' ? 'alert' : 'status'}
            aria-live={t.variant === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
          >
            <p>{t.message}</p>
            {primaryAction || secondaryAction ? (
              <div className="mt-2 flex items-center justify-end gap-2">
                {secondaryAction ? (
                  <button
                    type="button"
                    onClick={() => onAction(secondaryAction)}
                    className="rounded-md border border-current/30 px-2.5 py-1 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    {secondaryAction.label}
                  </button>
                ) : null}
                {primaryAction ? (
                  <button
                    type="button"
                    onClick={() => onAction(primaryAction)}
                    className="rounded-md border border-current/30 px-2.5 py-1 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    {primaryAction.label}
                  </button>
                ) : null}
              </div>
            ) : null}
          </output>
        ) : null}
      </div>
    </ToastContext.Provider>
  )
}
