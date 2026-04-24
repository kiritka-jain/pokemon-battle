import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { BoardMood } from '@/src/lib/board/arenaTheme'

type BoardVisualPrefsState = {
  highContrastBoard: boolean
  boardMood: BoardMood
  setHighContrastBoard: (value: boolean) => void
  setBoardMood: (value: BoardMood) => void
}

export const useBoardVisualPrefsStore = create<BoardVisualPrefsState>()(
  persist(
    (set) => ({
      highContrastBoard: false,
      boardMood: 'standard',
      setHighContrastBoard: (value) => set({ highContrastBoard: value }),
      setBoardMood: (value) => set({ boardMood: value }),
    }),
    { name: 'pokepath-board-visual-prefs' },
  ),
)
