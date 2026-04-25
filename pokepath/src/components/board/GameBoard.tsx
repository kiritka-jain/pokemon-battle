'use client'

import type { MouseEvent, ReactNode, TouchEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { validateMove } from '@/src/lib/engine/moveValidator'
import { getArenaBoardOuterRingClass, getArenaChromeClasses } from '@/src/lib/board/arenaTheme'
import { useGameStore } from '@/src/lib/store/gameStore'
import type { GameState, PlayerKey } from '@/src/types/game'

import { FenceOverlay } from './FenceOverlay'
import { FenceSlotGrid } from './FenceSlotGrid'
import { PlayerSprites } from './PlayerSprite'
import { Tile } from './Tile'

type GameBoardProps = {
  localPlayerKey?: PlayerKey
  /** Seat used only for board rotation; engine coords unchanged. Default keeps hot-seat / legacy layout. */
  viewAsPlayer?: PlayerKey
  /** Compact mode for match screen: tighter controls so board stays in focus. */
  compact?: boolean
}

export function GameBoard({
  localPlayerKey = 'player1',
  viewAsPlayer = 'player1',
  compact = false,
}: GameBoardProps) {
  const [interactionMode, setInteractionMode] = useState<'move' | 'fence'>('move')
  const [fenceOrientation, setFenceOrientation] = useState<'H' | 'V'>('H')
  const [hoverFenceSlot, setHoverFenceSlot] = useState<{
    x: number
    y: number
    orientation: 'H' | 'V'
  } | null>(null)
  const lastFenceTapAtRef = useRef(0)

  const matchId = useGameStore((s) => s.matchId)
  const arena = useGameStore((s) => s.arena)
  const turn = useGameStore((s) => s.turn)
  const status = useGameStore((s) => s.status)
  const fences = useGameStore((s) => s.fences)
  const pendingAction = useGameStore((s) => s.pendingAction)
  const player1 = useGameStore((s) => s.players.player1)
  const player2 = useGameStore((s) => s.players.player2)
  const winner = useGameStore((s) => s.winner)
  const error = useGameStore((s) => s.error)
  const errorCode = useGameStore((s) => s.errorCode)
  const setPendingAction = useGameStore((s) => s.setPendingAction)

  const canInteract =
    status === 'active' && winner === null && turn === localPlayerKey

  const validDestinations = useMemo(() => {
    const set = new Set<string>()
    if (!canInteract) return set
    const gs: GameState = {
      matchId,
      status,
      turn,
      arena,
      players: { player1, player2 },
      fences,
      pendingAction,
      winner,
      error,
      errorCode,
    }
    for (let x = 0; x < 9; x++) {
      for (let y = 0; y < 9; y++) {
        if (validateMove(gs.turn, { x, y }, gs).valid) {
          set.add(`${x},${y}`)
        }
      }
    }
    return set
  }, [
    canInteract,
    matchId,
    arena,
    status,
    turn,
    player1,
    player2,
    fences,
    pendingAction,
    winner,
    error,
    errorCode,
  ])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (interactionMode === 'fence') {
          e.preventDefault()
          setFenceOrientation((o) => (o === 'H' ? 'V' : 'H'))
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [interactionMode])

  const onSelectMove = useCallback(
    (x: number, y: number) => {
      setPendingAction({ type: 'move', targetPos: { x, y } })
    },
    [setPendingAction]
  )

  const onPickFence = useCallback(
    (x: number, y: number, orientation: 'H' | 'V') => {
      setPendingAction({ type: 'fence', targetFence: { x, y, orientation } })
    },
    [setPendingAction]
  )

  const pendingFenceVisual =
    pendingAction.type === 'fence' && pendingAction.targetFence
      ? pendingAction.targetFence
      : null
  const previewFenceOwner: PlayerKey | null = pendingFenceVisual ? turn : null

  const chrome = getArenaChromeClasses(arena)

  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      if (interactionMode !== 'fence') return
      e.preventDefault()
      setFenceOrientation((o) => (o === 'H' ? 'V' : 'H'))
    },
    [interactionMode]
  )

  const handleBoardTouchEnd = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (interactionMode !== 'fence') return
      const now = Date.now()
      const sinceLastTap = now - lastFenceTapAtRef.current
      if (sinceLastTap > 0 && sinceLastTap <= 320) {
        e.preventDefault()
        setFenceOrientation((o) => (o === 'H' ? 'V' : 'H'))
      }
      lastFenceTapAtRef.current = now
    },
    [interactionMode]
  )

  const tiles: ReactNode[] = []
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const key = `${x},${y}`
      const isPending =
        pendingAction.type === 'move' &&
        pendingAction.targetPos?.x === x &&
        pendingAction.targetPos?.y === y
      tiles.push(
        <Tile
          key={key}
          arena={arena}
          x={x}
          y={y}
          isLight={(x + y) % 2 === 0}
          interactionMode={interactionMode}
          isPendingMoveTarget={Boolean(isPending)}
          isValidMoveDestination={validDestinations.has(key)}
          canInteract={canInteract}
          onSelectMove={onSelectMove}
        />
      )
    }
  }

  return (
    <div
      className="w-full max-w-[520px]"
      onContextMenu={handleContextMenu}
    >
      <div className={`${compact ? 'mb-2 gap-1.5' : 'mb-3 gap-2'} flex flex-wrap items-center`}>
        <div className={`flex rounded-lg border p-0.5 ${chrome.shell}`}>
          <button
            type="button"
            className={`rounded-md font-medium transition-colors ${compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'} ${
              interactionMode === 'move' ? chrome.active : chrome.inactive
            }`}
            onClick={() => setInteractionMode('move')}
          >
            Move
          </button>
          <button
            type="button"
            className={`rounded-md font-medium transition-colors ${compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'} ${
              interactionMode === 'fence' ? chrome.active : chrome.inactive
            }`}
            onClick={() => setInteractionMode('fence')}
          >
            Fence
          </button>
        </div>
        {interactionMode === 'fence' && (
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-zinc-600 dark:text-zinc-400`}>
            <kbd className="rounded border border-zinc-400 px-1 font-mono text-xs">R</kbd> rotate ({fenceOrientation})
            {compact
              ? ' or double-tap the board.'
              : '. Right-click or double-tap the board to rotate; hover a gap to preview.'}
          </p>
        )}
      </div>

      <div
        className={`relative mx-auto aspect-square w-[100vw] max-w-[500px] select-none ${
          viewAsPlayer === 'player2' ? 'origin-center rotate-180' : ''
        }`}
        onTouchEnd={handleBoardTouchEnd}
      >
        <div
          className={`absolute inset-0 z-0 grid grid-cols-9 grid-rows-9 gap-0 overflow-hidden rounded-sm ${getArenaBoardOuterRingClass(arena)}`}
        >
          {tiles}
        </div>

        <FenceOverlay
          arena={arena}
          fences={fences}
          pendingFence={pendingFenceVisual}
          pendingPlacedBy={previewFenceOwner}
          hoverFence={
            interactionMode === 'fence' && canInteract
              ? hoverFenceSlot
              : null
          }
        />

        <FenceSlotGrid
          arena={arena}
          orientation={fenceOrientation}
          visible={interactionMode === 'fence' && canInteract}
          onHover={setHoverFenceSlot}
          onPick={onPickFence}
        />

        <PlayerSprites />
      </div>
    </div>
  )
}
