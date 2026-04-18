import { motion } from 'framer-motion';
import { usePlayerState, usePlayerActions } from '@/context/PlayerContextCore';
import { useNavigate } from 'react-router-dom';
import { Play, Pause } from 'lucide-react';

export default function MiniPlayer() {
  const { preset, isPlaying, elapsed, timerSeconds } = usePlayerState();
  const { pause, resume } = usePlayerActions();
  const navigate = useNavigate();

  if (!preset) return null;

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const remaining = timerSeconds ? Math.max(timerSeconds - elapsed, 0) : null;
  const progress = timerSeconds ? Math.min(elapsed / timerSeconds, 1) : 0;

  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      className="fixed bottom-16 left-4 right-4 z-50"
    >
      <button
        onClick={() => navigate('/player')}
        className="w-full glass rounded-2xl p-3 flex items-center gap-3 glow-primary relative overflow-hidden"
      >
        {/* Progress bar at bottom */}
        {timerSeconds && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${progress * 100}%` }}
            />
          </div>
        )}
        
        <motion.div
          animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl"
        >
          {preset.icon}
        </motion.div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{preset.name}</p>
          <p className="text-xs text-muted-foreground">
            {remaining !== null ? `${formatTime(remaining)} left` : formatTime(elapsed)}
          </p>
        </div>
        <motion.div
          whileTap={{ scale: 0.85 }}
          onTap={(e) => {
            e.stopPropagation();
            if (isPlaying) {
              pause();
            } else {
              resume();
            }
          }}
          className="relative w-10 h-10 rounded-full bg-primary flex items-center justify-center cursor-pointer"
        >
          <div className="absolute inset-0 z-10" />
          {isPlaying ? <Pause size={18} className="text-primary-foreground pointer-events-none" /> : <Play size={18} className="text-primary-foreground ml-0.5 pointer-events-none" />}
        </motion.div>
      </button>
    </motion.div>
  );
}
