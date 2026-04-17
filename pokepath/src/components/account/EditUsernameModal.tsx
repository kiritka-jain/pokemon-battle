'use client'

import { useCallback, useEffect, useState } from 'react'

import { validateUsernameForSave } from '@/src/lib/profile/usernameValidation'
import { supabase } from '@/src/lib/supabase/client'

type EditUsernameModalProps = {
  open: boolean
  initialUsername: string
  onClose: () => void
  onSaved: (username: string) => void
}

function isUniqueViolation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  if (error.code === '23505') return true
  const m = error.message?.toLowerCase() ?? ''
  return m.includes('duplicate') || m.includes('unique')
}

export function EditUsernameModal({
  open,
  initialUsername,
  onClose,
  onSaved,
}: EditUsernameModalProps) {
  const [value, setValue] = useState(initialUsername)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setValue(initialUsername)
      setError(null)
      setSaving(false)
    }
  }, [open, initialUsername])

  const handleSave = useCallback(async () => {
    setError(null)
    const validated = validateUsernameForSave(value)
    if (!validated.ok) {
      setError(validated.error)
      return
    }

    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be signed in to save.')
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: validated.username })
      .eq('id', user.id)

    if (updateError) {
      setError(
        isUniqueViolation(updateError)
          ? 'That username is taken.'
          : updateError.message || 'Could not save username.',
      )
      setSaving(false)
      return
    }

    onSaved(validated.username)
    onClose()
    setSaving(false)
  }, [value, onSaved, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-username-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <h2
          id="edit-username-title"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Edit username
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          This name is shown to opponents in matches.
        </p>

        <label htmlFor="edit-username-input" className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Username
        </label>
        <input
          id="edit-username-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={saving}
          autoComplete="username"
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-600 focus:ring-2 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />

        {error ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-11 flex-1 items-center justify-center rounded-lg border border-zinc-300 text-sm font-medium text-zinc-900 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="flex h-11 flex-1 items-center justify-center rounded-lg bg-emerald-700 text-sm font-medium text-white disabled:opacity-60 dark:bg-emerald-600"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
