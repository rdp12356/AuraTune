import { createContext, useContext } from 'react';
import { FrequencyPreset } from '@/lib/presets';

export interface PlayerState {
  preset: FrequencyPreset | null;
  isPlaying: boolean;
  volume: number;
  bgSound: string;
  bgVolume: number;
  timerSeconds: number | null; // null = infinite
  elapsed: number;
}

export interface PlayerActions {
  play: (preset: FrequencyPreset) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  setBgSound: (s: string) => void;
  setBgVolume: (v: number) => void;
  setTimer: (seconds: number | null) => void;
}

export const PlayerStateContext = createContext<PlayerState | null>(null);
export const PlayerActionsContext = createContext<PlayerActions | null>(null);

export function usePlayerState() {
  const ctx = useContext(PlayerStateContext);
  if (!ctx) throw new Error('usePlayerState must be inside PlayerProvider');
  return ctx;
}

export function usePlayerActions() {
  const ctx = useContext(PlayerActionsContext);
  if (!ctx) throw new Error('usePlayerActions must be inside PlayerProvider');
  return ctx;
}

export function usePlayer() {
  const state = usePlayerState();
  const actions = usePlayerActions();
  return { ...state, ...actions };
}
