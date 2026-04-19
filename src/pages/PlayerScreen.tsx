import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerState, usePlayerActions } from '@/context/PlayerContextCore';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Square, ChevronDown, Volume2, Timer, Brain, Moon } from 'lucide-react';
import { backgroundSounds, timerPresets, smartRoutines } from '@/lib/presets';
import { useEffect, useState } from 'react';
import BrainAnimation from '@/components/BrainAnimation';

export default function PlayerScreen() {
  const {
    preset, isPlaying, volume, bgSound, bgVolume, timerSeconds, elapsed,
  } = usePlayerState();
  const {
    pause, resume, stop, setVolume, setBgSound, setBgVolume, setTimer,
  } = usePlayerActions();
  const navigate = useNavigate();
  const [showQuickVolume, setShowQuickVolume] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'sound' | 'timer'>('sound');
  const [customHours, setCustomHours] = useState('0');
  const [customMinutes, setCustomMinutes] = useState('25');

  useEffect(() => {
    if (!preset) {
      navigate('/', { replace: true });
    }
  }, [navigate, preset]);

  if (!preset) {
    return null;
  }

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const remaining = timerSeconds ? Math.max(timerSeconds - elapsed, 0) : null;
  const progress = timerSeconds ? Math.min(elapsed / timerSeconds, 1) : 0;
  const circumference = 2 * Math.PI * 120;

  const applyCustomTimer = () => {
    const totalSecs = (parseInt(customHours || '0') * 3600) + (parseInt(customMinutes || '0') * 60);
    if (totalSecs > 0) setTimer(totalSecs);
  };

  const applyVolume = (value: string) => {
    setVolume(parseFloat(value));
  };

  const applyBgVolume = (value: string) => {
    setBgVolume(parseFloat(value));
  };

  const openVolumeControls = () => {
    setShowQuickVolume(v => !v);
  };

  useEffect(() => {
    if (!showQuickVolume) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showQuickVolume]);

  return (
    <div className="min-h-screen gradient-player flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onTap={() => navigate('/')} className="p-2 -ml-2">
          <ChevronDown size={24} className="text-foreground" />
        </motion.button>
        <span className="text-sm font-medium text-muted-foreground">{preset.waveType} Waves</span>
        <div className="w-8" />
      </div>

      {/* Center - Progress ring & controls */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        {/* Animated glow behind */}
        <motion.div
          animate={isPlaying ? { scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] } : { scale: 1, opacity: 0.05 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-80 h-80 rounded-full bg-primary/20 blur-3xl"
          style={{ willChange: 'transform, opacity' }}
        />

        {/* Progress ring */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 288 288">
            <circle cx="144" cy="144" r="130" fill="none" stroke="hsl(var(--border))" strokeWidth="3" opacity="0.3" />
            {timerSeconds && (
              <motion.circle
                cx="144" cy="144" r="130" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 130}
                strokeDashoffset={(2 * Math.PI * 130) * (1 - progress)}
                transition={{ duration: 0.5 }}
              />
            )}
          </svg>

          <div className="flex flex-col items-center z-10">
            <div className="mb-3">
              <BrainAnimation isPlaying={isPlaying} size={56} />
            </div>
            <h2 className="text-xl font-bold text-foreground">{preset.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{preset.beatHz}Hz {preset.waveType}</p>

            {/* Countdown or elapsed */}
            <p className="text-3xl font-mono text-foreground mt-4 tabular-nums tracking-tight">
              {remaining !== null ? formatTime(remaining) : formatTime(elapsed)}
            </p>
            {timerSeconds && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {remaining !== null ? 'remaining' : `/ ${formatTime(timerSeconds)}`}
              </p>
            )}
          </div>
        </div>

        {/* Play controls */}
        <div className="flex items-center gap-8 mt-10">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onTap={stop}
            className="relative w-14 h-14 rounded-full glass flex items-center justify-center active:bg-muted/50"
          >
            <div className="absolute inset-0 z-10" />
            <Square size={18} className="text-foreground pointer-events-none" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onTap={() => isPlaying ? pause() : resume()}
            className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center glow-primary active:brightness-110"
          >
            <div className="absolute inset-0 z-10" />
            <AnimatePresence mode="popLayout">
              {isPlaying ? (
                <motion.div key="pause" className="pointer-events-none flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                  <Pause size={32} className="text-primary-foreground" />
                </motion.div>
              ) : (
                <motion.div key="play" className="pointer-events-none flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                  <Play size={32} className="text-primary-foreground ml-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onTap={openVolumeControls}
            className={`relative w-14 h-14 rounded-full glass flex items-center justify-center active:bg-muted/50 ${showQuickVolume ? 'ring-2 ring-primary' : ''}`}
          >
            <div className="absolute inset-0 z-10" />
            <Volume2 size={18} className="text-foreground pointer-events-none" />
          </motion.button>
        </div>

        <AnimatePresence>
          {showQuickVolume && (
            <>
            <motion.button
              type="button"
              aria-label="Close controls"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuickVolume(false)}
              className="fixed inset-0 bg-black/35 z-30"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed left-1/2 -translate-x-1/2 bottom-5 w-[calc(100%-1.5rem)] max-w-[360px] max-h-[70vh] overflow-y-auto glass rounded-2xl px-5 py-4 shadow-2xl z-40"
            >
              <div className="flex gap-1 mb-4 bg-muted/30 rounded-xl p-1">
                <button
                  onClick={() => setSettingsTab('sound')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    settingsTab === 'sound' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  <Volume2 size={14} /> Sound
                </button>
                <button
                  onClick={() => setSettingsTab('timer')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    settingsTab === 'timer' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  <Timer size={14} /> Timer
                </button>
              </div>

              {settingsTab === 'sound' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Frequency Volume</span>
                      <span className="text-xs font-mono text-primary">{Math.round(volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onInput={e => applyVolume((e.target as HTMLInputElement).value)}
                      onChange={e => applyVolume(e.target.value)}
                      className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Background Sound</label>
                    <div className="flex gap-2 flex-wrap">
                      {backgroundSounds.map(s => (
                        <motion.button
                          key={s.id}
                          whileTap={{ scale: 0.95 }}
                          onTap={() => setBgSound(s.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                            bgSound === s.id ? 'bg-primary text-primary-foreground' : 'glass text-muted-foreground'
                          }`}
                        >
                          {s.icon} {s.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {bgSound !== 'none' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Background Volume</span>
                        <span className="text-xs font-mono text-primary">{Math.round(bgVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={bgVolume}
                        onInput={e => applyBgVolume((e.target as HTMLInputElement).value)}
                        onChange={e => applyBgVolume(e.target.value)}
                        className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  )}
                </div>
              )}

              {settingsTab === 'timer' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Quick Timer</label>
                    <div className="grid grid-cols-3 gap-2">
                      {timerPresets.map(opt => (
                        <motion.button key={opt.label} whileTap={{ scale: 0.92 }} onTap={() => setTimer(opt.value)}
                          className={`py-2 rounded-xl text-[11px] font-medium transition-all flex flex-col items-center ${
                            timerSeconds === opt.value
                              ? 'bg-primary text-primary-foreground'
                              : 'glass text-muted-foreground'
                          }`}
                        >
                          <span className="font-semibold">{opt.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Custom Timer</label>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 glass rounded-xl px-3 py-2.5">
                        <label className="text-[9px] text-muted-foreground">Hours</label>
                        <input
                          type="number"
                          value={customHours}
                          onChange={e => setCustomHours(e.target.value)}
                          className="w-full bg-transparent text-foreground text-lg font-semibold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="0"
                          max="12"
                        />
                      </div>
                      <div className="flex-1 glass rounded-xl px-3 py-2.5">
                        <label className="text-[9px] text-muted-foreground">Minutes</label>
                        <input
                          type="number"
                          value={customMinutes}
                          onChange={e => setCustomMinutes(e.target.value)}
                          className="w-full bg-transparent text-foreground text-lg font-semibold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="0"
                          max="59"
                        />
                      </div>
                      <motion.button whileTap={{ scale: 0.92 }} onTap={applyCustomTimer}
                        className="bg-primary text-primary-foreground px-3 py-3 rounded-xl text-xs font-semibold"
                      >
                        Set
                      </motion.button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Smart Routines</label>
                    <div className="space-y-2 max-h-36 overflow-auto pr-1">
                      {smartRoutines.map(routine => (
                        <motion.button key={routine.id} whileTap={{ scale: 0.97 }} onTap={() => setTimer(routine.focusMinutes * 60)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                            timerSeconds === routine.focusMinutes * 60
                              ? 'bg-primary/10 border border-primary/30'
                              : 'glass'
                          }`}
                        >
                          <span className="text-xl">
                            {routine.id === 'pomodoro' ? <Timer size={18} className="text-destructive" /> :
                             routine.id === 'deep-work' ? <Brain size={18} className="text-primary" /> :
                             <Moon size={18} className="text-warm" />}
                          </span>
                          <div className="flex-1 text-left">
                            <p className="text-xs font-semibold text-foreground">{routine.name}</p>
                            <p className="text-[10px] text-muted-foreground">{routine.description}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
