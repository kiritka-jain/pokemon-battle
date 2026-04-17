'use client'

import { ToastProvider } from '@/src/components/ui/toast'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}
