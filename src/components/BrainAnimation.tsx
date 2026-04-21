import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface Props {
  isPlaying: boolean;
  size?: number;
}

export default function BrainAnimation({ isPlaying, size = 64 }: Props) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing rings */}
      {isPlaying && (
        <>
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute rounded-full border border-primary/30"
            style={{ width: size * 1.5, height: size * 1.5, willChange: 'transform, opacity' }}
          />
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute rounded-full border border-primary/20"
            style={{ width: size * 1.8, height: size * 1.8, willChange: 'transform, opacity' }}
          />
        </>
      )}

      {/* Glow */}
      <motion.div
        animate={isPlaying ? { opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] } : { opacity: 0.1, scale: 1 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full bg-primary/20 blur-xl"
        style={{ width: size * 1.2, height: size * 1.2, willChange: 'transform, opacity' }}
      />

      {/* Brain icon */}
      <motion.div
        animate={isPlaying ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Brain size={size} className="text-primary" strokeWidth={1.5} />
      </motion.div>
    </div>
  );
}
