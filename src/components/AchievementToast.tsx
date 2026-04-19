import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  type AchievementUnlock,
  setAchievementUnlockCallback,
} from '@/hooks/useAchievementChecker';

export default function AchievementToast() {
  const [current, setCurrent] = useState<AchievementUnlock | null>(null);

  const handleUnlock = useCallback((achievement: AchievementUnlock) => {
    setCurrent(achievement);

    // Fire confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.3 },
      colors: ['#a78bfa', '#f59e0b', '#10b981', '#ec4899', '#6366f1'],
    });

    setTimeout(() => setCurrent(null), 4000);
  }, []);

  useEffect(() => {
    setAchievementUnlockCallback(handleUnlock);
    return () => setAchievementUnlockCallback(null);
  }, [handleUnlock]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] w-[85vw] max-w-sm"
        >
          <div className="glass rounded-2xl p-4 border border-primary/30 shadow-lg shadow-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <Trophy size={24} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">
                  🎉 Achievement Unlocked!
                </p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{current.name}</p>
                <p className="text-[11px] text-muted-foreground">{current.description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
