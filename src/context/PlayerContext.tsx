import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import * as audio from '@/lib/audioEngine';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';
import { PlayerStateContext, PlayerActionsContext, PlayerState, PlayerActions } from './PlayerContextCore';

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    preset: null,
    isPlaying: false,
    volume: 0.68,
    bgSound: 'none',
    bgVolume: 0.55,
    timerSeconds: null,
    elapsed: 0,
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playbackStartedAtRef = useRef<number | null>(null);
  const elapsedBeforePlaybackRef = useRef(0);
  const timerSecondsRef = useRef<number | null>(null);

  useEffect(() => {
    timerSecondsRef.current = state.timerSeconds;
  }, [state.timerSeconds]);

  const getElapsedSeconds = useCallback(() => {
    if (playbackStartedAtRef.current === null) {
      return elapsedBeforePlaybackRef.current;
    }

    return elapsedBeforePlaybackRef.current + Math.floor((Date.now() - playbackStartedAtRef.current) / 1000);
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const syncElapsed = useCallback(() => {
    const elapsed = getElapsedSeconds();

    setState(prev => (prev.elapsed === elapsed ? prev : { ...prev, elapsed }));

    const timerSeconds = timerSecondsRef.current;
    if (timerSeconds !== null && elapsed >= timerSeconds) {
      elapsedBeforePlaybackRef.current = elapsed;
      playbackStartedAtRef.current = null;
      audio.stopAll();
      clearTimer();
      setState(prev => ({ ...prev, elapsed, isPlaying: false }));
      return true;
    }

    return false;
  }, [clearTimer, getElapsedSeconds]);

  const startTimer = useCallback((startingElapsed: number) => {
    clearTimer();
    elapsedBeforePlaybackRef.current = startingElapsed;
    playbackStartedAtRef.current = Date.now();

    syncElapsed();
    intervalRef.current = setInterval(() => {
      syncElapsed();
    }, 1000); // UI update once per second is enough and saves battery
  }, [clearTimer, syncElapsed]);

  const startPlayback = useCallback((preset: FrequencyPreset, resetElapsed = true) => {
    const nextElapsed = resetElapsed ? 0 : elapsedBeforePlaybackRef.current;
    const { volume, bgSound, bgVolume } = stateRef.current;

    audio.startBinauralBeat(preset.carrierHz, preset.beatHz, volume);
    if (bgSound !== 'none') {
      audio.startBackgroundSound(bgSound, bgVolume);
    }

    setState(prev => ({ ...prev, preset, isPlaying: true, elapsed: nextElapsed }));
    startTimer(nextElapsed);
  }, [startTimer]);

  const play = useCallback((preset: FrequencyPreset) => {
    audio.stopAll();
    startPlayback(preset, true);
  }, [startPlayback]);

  const pause = useCallback(() => {
    const elapsed = getElapsedSeconds();
    elapsedBeforePlaybackRef.current = elapsed;
    playbackStartedAtRef.current = null;
    audio.stopBinauralBeat();
    audio.stopBackgroundSound();
    clearTimer();
    void BackgroundMode.disable();
    setState(prev => ({ ...prev, isPlaying: false, elapsed }));
  }, [clearTimer, getElapsedSeconds]);

  const resume = useCallback(() => {
    if (stateRef.current.preset) {
      audio.stopAll();
      startPlayback(stateRef.current.preset, false);
    }
  }, [startPlayback]);

  const stop = useCallback(() => {
    audio.stopAll();
    clearTimer();
    const finalElapsed = getElapsedSeconds();
    playbackStartedAtRef.current = null;
    elapsedBeforePlaybackRef.current = finalElapsed;
    void BackgroundMode.disable();
    // First set isPlaying=false (triggers session finalize with current elapsed)
    setState(prev => ({ ...prev, isPlaying: false, elapsed: finalElapsed }));
    // Then reset elapsed and preset after a tick so the finalize effect can capture the data
    setTimeout(() => {
      elapsedBeforePlaybackRef.current = 0;
      setState(prev => ({ ...prev, elapsed: 0, preset: null }));
    }, 100);
  }, [clearTimer, getElapsedSeconds]);

  const setVolume = useCallback((v: number) => {
    audio.setVolume(v);
    setState(prev => ({ ...prev, volume: v }));
  }, []);

  const setBgSound = useCallback((s: string) => {
    const { isPlaying, bgVolume } = stateRef.current;
    if (isPlaying) {
      audio.stopBackgroundSound();
      if (s !== 'none') audio.startBackgroundSound(s, bgVolume);
    }
    setState(prev => ({ ...prev, bgSound: s }));
  }, []);

  const setBgVolume = useCallback((v: number) => {
    audio.setBgVolume(v);
    setState(prev => ({ ...prev, bgVolume: v }));
  }, []);

  const setTimer = useCallback((seconds: number | null) => {
    setState(prev => ({ ...prev, timerSeconds: seconds }));
    const { isPlaying, preset } = stateRef.current;
    if (isPlaying && preset) {
      elapsedBeforePlaybackRef.current = 0;
      playbackStartedAtRef.current = Date.now();
      clearTimer();
      syncElapsed();
      intervalRef.current = setInterval(() => {
        syncElapsed();
      }, 1000);
    }
  }, [clearTimer, syncElapsed]);

  const actions = useMemo(() => ({
    play, pause, resume, stop, setVolume, setBgSound, setBgVolume, setTimer
  }), [play, pause, resume, stop, setVolume, setBgSound, setBgVolume, setTimer]);

  const bgModeEnabledRef = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && stateRef.current.isPlaying) {
        audio.resumeAudioContext();
        syncElapsed();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handleVisibilityChange);
    };
  }, [syncElapsed]);

  // ── Background mode: enable ONCE when playback starts, disable ONCE when it stops ──
  useEffect(() => {
    if (state.isPlaying && !bgModeEnabledRef.current) {
      bgModeEnabledRef.current = true;
      void BackgroundMode.setSettings({
        title: 'AuraTune',
        text: state.preset?.name ? `Playing: ${state.preset.name}` : 'Streaming focus frequencies',
        icon: 'ic_launcher',
        visibility: 'public',
        importance: 'high',
      }).then(() => {
        void BackgroundMode.enable();
      });
    } else if (!state.isPlaying && bgModeEnabledRef.current) {
      bgModeEnabledRef.current = false;
      void BackgroundMode.disable();
    }
  }, [state.isPlaying, state.preset?.name]);

  // ── AudioContext heartbeat: resume if Android silently suspended it ──────────
  // Android can quietly suspend the WebView AudioContext even with BackgroundMode
  // enabled. Polling every 8s and resuming it keeps audio alive.
  useEffect(() => {
    if (!state.isPlaying) return;
    const heartbeat = setInterval(() => {
      audio.resumeAudioContext();
    }, 8000);
    return () => clearInterval(heartbeat);
  }, [state.isPlaying]);

  useEffect(() => {
    return () => {
      audio.stopAll();
      clearTimer();
      playbackStartedAtRef.current = null;
    };
  }, [clearTimer]);

  return (
    <PlayerStateContext.Provider value={state}>
      <PlayerActionsContext.Provider value={actions}>
        {children}
      </PlayerActionsContext.Provider>
    </PlayerStateContext.Provider>
  );
}
