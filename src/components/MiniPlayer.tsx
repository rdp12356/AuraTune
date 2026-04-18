import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '@/context/PlayerContextCore';
import { Play, Pause, Music } from 'lucide-react';

export default function MiniPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { preset, isPlaying, play, pause, resume } = usePlayer();

  const hiddenRoutes = ['/player', '/onboarding', '/auth', '/reset-password'];
  const isHidden = !preset || hiddenRoutes.includes(location.pathname);

  if (isHidden) return null;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={() => navigate('/player')}
        className="fixed bottom-[72px] left-4 right-4 z-30 bg-card/95 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between shadow-2xl border border-primary/20 cursor-pointer overflow-hidden group active:scale-[0.98] transition-transform"
      >
        {/* Progress bar background */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-muted/20" />
        
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center relative shrink-0">
            <span className="text-xl relative z-10">{preset.icon}</span>
            {isPlaying && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-xl bg-primary/20" 
              />
            )}
          </div>
          
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-foreground truncate">{preset.name}</h4>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Music size={10} />
              {preset.category}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center hover:bg-primary/25 transition-colors group-hover:scale-110"
        >
          {isPlaying ? (
            <Pause size={18} className="text-primary fill-primary" />
          ) : (
            <Play size={18} className="text-primary fill-primary ml-0.5" />
          )}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
