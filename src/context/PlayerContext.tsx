import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
import * as audio from '@/lib/audioEngine';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';
import { backgroundSounds, FrequencyPreset } from '@/lib/presets';
import { AUDIO_CONFIG } from '@/constants';
import { PlayerStateContext, PlayerActionsContext, PlayerState, PlayerActions } from './PlayerContextCore';

// Track if provider is already mounted to prevent double initialization
let isPlayerProviderMounted = false;

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  // Prevent double mounting in React StrictMode
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isPlayerProviderMounted) {
      console.warn('PlayerProvider is already mounted. Only one instance allowed.');
      return;
    }
    isPlayerProviderMounted = true;
    setIsReady(true);

    return () => {
      isPlayerProviderMounted = false;
      // Cleanup audio engine on unmount
      audio.cleanupAudioEngine();
    };
  }, []);

  const [state, setState] = useState<PlayerState>({
    preset: null,
    isPlaying: false,
    volume: AUDIO_CONFIG.DEFAULT_VOLUME,
    bgSound: 'none',
    bgVolume: AUDIO_CONFIG.DEFAULT_BG_VOLUME,
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
  const isAndroidRef = useRef(Capacitor.getPlatform() === 'android');

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

  const formatDuration = useCallback((seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const remainingSeconds = safeSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${remainingSeconds}s`;
  }, []);

  const buildNotificationSettings = useCallback(() => {
    const currentState = stateRef.current;
    const presetName = currentState.preset?.name ?? 'Listening session';
    const bgSoundName = backgroundSounds.find(sound => sound.id === currentState.bgSound)?.name ?? 'None';
    const timerLabel = currentState.timerSeconds !== null ? `Timer ${formatDuration(currentState.timerSeconds)}` : 'No timer';
    const elapsedLabel = currentState.elapsed > 0 ? `Elapsed ${formatDuration(currentState.elapsed)}` : 'Ready to play';

    return {
      title: 'AuraTune',
      text: `Now playing: ${presetName}`,
      subText: `${bgSoundName} background · ${timerLabel} · ${elapsedLabel}`,
      bigText: true,
      resume: true,
      silent: false,
      hidden: false,
      color: '0F172A',
      icon: 'ic_notification_audio',
      channelName: 'AuraTune Playback',
      channelDescription: 'Keeps AuraTune active while audio plays',
      allowClose: true,
      closeIcon: 'ic_notification_close',
      closeTitle: 'Stop',
      showWhen: true,
      visibility: 'public' as const,
      disableWebViewOptimization: false,
    };
  }, [formatDuration]);

  const syncBackgroundNotification = useCallback(async () => {
    if (!isAndroidRef.current || typeof document === 'undefined') {
      return;
    }

    try {
      const permissionStatus = await BackgroundMode.checkNotificationsPermission();
      if (permissionStatus.notifications !== 'granted') {
        const requestedStatus = await BackgroundMode.requestNotificationsPermission();
        if (requestedStatus.notifications !== 'granted') {
          return;
        }
      }

      const notificationSettings = buildNotificationSettings();

      if (!bgModeEnabledRef.current) {
        bgModeEnabledRef.current = true;
        await BackgroundMode.enable(notificationSettings);
      } else {
        await BackgroundMode.updateNotification(notificationSettings);
      }
    } catch {
      // Background notifications are best effort; playback continues if they fail.
    }
  }, [buildNotificationSettings]);

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
      void syncBackgroundNotification();
    } else if (!state.isPlaying && bgModeEnabledRef.current) {
      bgModeEnabledRef.current = false;
      void BackgroundMode.disable();
    }
  }, [state.isPlaying, syncBackgroundNotification]);

  useEffect(() => {
    if (!state.isPlaying || !bgModeEnabledRef.current) {
      return;
    }

    void syncBackgroundNotification();
  }, [state.preset, state.bgSound, state.timerSeconds, state.elapsed, state.isPlaying, syncBackgroundNotification]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    const session = navigator.mediaSession;
    const current = stateRef.current;
    const bgSoundName = backgroundSounds.find(sound => sound.id === current.bgSound)?.name ?? 'None';

    if (current.preset) {
      session.metadata = new MediaMetadata({
        title: current.preset.name,
        artist: 'AuraTune',
        album: `${current.preset.waveType} • ${bgSoundName}`,
        artwork: [
          { src: '/logo-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png' },
        ],
      });
    }

    session.playbackState = current.isPlaying ? 'playing' : 'paused';

    const safeSetActionHandler = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler | null,
    ) => {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // Some platforms do not support every action.
      }
    };

    safeSetActionHandler('play', () => resume());
    safeSetActionHandler('pause', () => pause());
    safeSetActionHandler('stop', () => stop());

    return () => {
      safeSetActionHandler('play', null);
      safeSetActionHandler('pause', null);
      safeSetActionHandler('stop', null);
    };
  }, [state.isPlaying, state.preset, state.bgSound, pause, resume, stop]);

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

      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        const session = navigator.mediaSession;
        session.playbackState = 'none';
        session.metadata = null;
      }
    };
  }, [clearTimer]);

  return (
    <PlayerStateContext.Provider value={state}>
      <PlayerActionsContext.Provider value={actions}>
        {isReady ? children : null}
      </PlayerActionsContext.Provider>
    </PlayerStateContext.Provider>
  );
}
