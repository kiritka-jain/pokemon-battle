'use client'

import { useLayoutEffect, useState } from 'react'

/**
 * Phone-style landscape: short viewport + bounded width. Excludes typical desktop
 * landscape (taller window). Tray/board are not rendered while locked — see children branch.
 */
export const PORTRAIT_ONLY_GAME_MEDIA =
  '(orientation: landscape) and (max-height: 520px) and (max-width: 1024px)'

export function PortraitOnlyGameShell({ children }: { children: React.ReactNode }) {
  const [lockLandscape, setLockLandscape] = useState(false)

  useLayoutEffect(() => {
    const mq = window.matchMedia(PORTRAIT_ONLY_GAME_MEDIA)
    const sync = () => setLockLandscape(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  if (lockLandscape) {
    /* z-[100]: above MobileActionTray (z-50); game UI not mounted so tray cannot show. */
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-zinc-950/95 px-6 text-center backdrop-blur-sm dark:bg-black/95"
        role="alertdialog"
        aria-live="assertive"
        aria-modal="true"
        aria-label="Portrait orientation required"
      >
        <p className="max-w-sm text-lg font-semibold text-zinc-50">
          Please rotate your device to portrait
        </p>
      </div>
    )
  }

  return <>{children}</>
}
