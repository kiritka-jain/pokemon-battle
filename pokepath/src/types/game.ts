// Game types for PokéPath - Route Rush
// This file will contain all TypeScript interfaces and types for the game

export type PlayerKey = 'player1' | 'player2';
export type FenceOrientation = 'H' | 'V';
export type GameStatus = 'waiting' | 'active' | 'finished';
export type ActionType = 'move' | 'fence';

export interface Position {
  x: number; // column 0-8
  y: number; // row 0-8
}

export interface PlayerState {
  id: string;         // Supabase user UUID
  pos: Position;
  fencesLeft: number; // starts at 10 (standard Quoridor), decrements on placement
  type: string;       // 'Normal' for V1, extensible for V2 (Ghost, etc.)
}

export interface Fence {
  id: string;                    // format: "h-3-3" or "v-3-3"
  x: number;                     // top-left anchor column (0-7)
  y: number;                     // top-left anchor row (0-7)
  orientation: FenceOrientation;
  placedBy: PlayerKey;
}

export interface PendingAction {
  type: ActionType | null;
  targetPos?: Position;
  targetFence?: { x: number; y: number; orientation: FenceOrientation };
}

export interface GameState {
  matchId: string | null;
  status: GameStatus;
  turn: PlayerKey;
  players: Record<PlayerKey, PlayerState>;
  fences: Fence[];
  pendingAction: PendingAction;
  winner: PlayerKey | null;
  /** Last validation error from commitAction (cleared on success / new match) */
  error: string | null;
}