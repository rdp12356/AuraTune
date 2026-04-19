import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Headphones, Heart, Moon, Sparkles, Sun } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MiniPlayer from '@/components/MiniPlayer';
import { usePlayerActions, usePlayerState } from '@/context/PlayerContextCore';
import { useTheme } from '@/context/ThemeContext';
import { useFavorites } from '@/hooks/useFavorites';
import {
  type Category,
  type FrequencyPreset,
  type Mood,
  categories,
  getRecommendedPresets,
  moods,
  presets,
} from '@/lib/presets';

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<Category>('focus');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const { preset: currentPreset, isPlaying } = usePlayerState();
  const { play } = usePlayerActions();
  const { theme, toggle } = useTheme();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const filtered = presets.filter(p => p.category === activeCategory).slice(0, 3);
  const favoritePresets = presets.filter(p => favorites.some(f => f.preset_id === p.id));
  const recommendedPresets = selectedMood ? getRecommendedPresets(selectedMood) : [];

  const handleSelect = useCallback((preset: FrequencyPreset) => {
    play(preset);
    navigate('/player');
  }, [play, navigate]);

  return (
    <div className="min-h-screen gradient-mesh pb-28">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AuraTune</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tune your mind</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={toggle}
            className="p-2.5 rounded-full glass"
          >
            {theme === 'dark' ? <Sun size={18} className="text-foreground" /> : <Moon size={18} className="text-foreground" />}
          </motion.button>
        </div>
      </div>

      {/* Headphones notice */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-5 mb-4 flex items-center gap-2.5 rounded-2xl glass px-4 py-3"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Headphones size={14} className="text-primary" />
        </div>
        <span className="text-xs text-muted-foreground">Use headphones for the true binaural effect</span>
      </motion.div>

      {/* Mood selector */}
      <div className="px-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-accent" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">How are you feeling?</h3>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {moods.map(mood => (
            <motion.button key={mood.id} whileTap={{ scale: 0.95 }} onTap={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedMood === mood.id
                  ? 'bg-primary text-primary-foreground glow-primary'
                  : 'glass text-muted-foreground'
              }`}
            >
              <span>{mood.icon}</span>
              <span>{mood.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mood recommendations */}
      <AnimatePresence>
        {selectedMood && recommendedPresets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 mb-5 overflow-hidden"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              ✨ Recommended for you
            </h3>
            <div className="space-y-2">
              {recommendedPresets.slice(0, 3).map((preset, i) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  index={i}
                  isActive={currentPreset?.id === preset.id && isPlaying}
                  isFav={isFavorite(preset.id)}
                  onSelect={handleSelect}
                  onToggleFav={toggleFavorite}
                  recommended
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorites section */}
      {favoritePresets.length > 0 && (
        <div className="px-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={14} className="text-destructive fill-destructive" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Favorites</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {favoritePresets.map((preset) => (
              <motion.button key={preset.id} whileTap={{ scale: 0.98 }} onTap={() => handleSelect(preset)}
                className={`flex-shrink-0 w-36 text-left rounded-2xl glass p-3.5 transition-all ${
                  currentPreset?.id === preset.id && isPlaying ? 'ring-2 ring-primary glow-primary' : ''
                }`}
              >
                <span className="text-2xl">{preset.icon}</span>
                <p className="text-sm font-semibold text-foreground mt-2 truncate">{preset.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{preset.beatHz}Hz {preset.waveType}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-2 px-5 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat, i) => (
          <motion.button key={cat.id} whileTap={{ scale: 0.95 }} onTap={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground glow-primary'
                : 'glass text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Category description */}
      <div className="px-5 mt-4 mb-3">
        <p className="text-sm text-muted-foreground">
          {categories.find(c => c.id === activeCategory)?.description}
        </p>
      </div>

      {/* Presets grid - only 3 */}
      <div className="px-5 space-y-3">
        {filtered.map((preset, i) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            index={i}
            isActive={currentPreset?.id === preset.id && isPlaying}
            isFav={isFavorite(preset.id)}
            onSelect={handleSelect}
            onToggleFav={toggleFavorite}
          />
        ))}
      </div>

      {/* More coming soon */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mx-5 mt-4 mb-6 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4"
      >
        <Sparkles size={14} className="text-muted-foreground" />
        <p className="text-xs text-muted-foreground font-medium">More frequencies coming soon</p>
      </motion.div>

      {/* Mini player */}
      {currentPreset && <MiniPlayer />}
    </div>
  );
}

const PresetCard = memo(({
  preset,
  index,
  isActive,
  isFav,
  onSelect,
  onToggleFav,
  recommended,
}: {
  preset: FrequencyPreset;
  index: number;
  isActive: boolean;
  isFav: boolean;
  onSelect: (p: FrequencyPreset) => void;
  onToggleFav: (id: string) => void;
  recommended?: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`w-full rounded-2xl glass p-4 transition-all ${
        isActive ? 'ring-2 ring-primary glow-primary' : ''
      } ${recommended ? 'border-accent/30' : ''}`}
    >
      <div className="flex items-start gap-4">
        <motion.button whileTap={{ scale: 0.98 }} onTap={() => onSelect(preset)}
          className="flex-1 text-left flex items-start gap-3.5 min-w-0"
        >
          <div className="text-3xl flex-shrink-0">{preset.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{preset.name}</h3>
              {recommended && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">
                  PICK
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{preset.benefit}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {preset.beatHz}Hz {preset.waveType}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Carrier: {preset.carrierHz}Hz
              </span>
            </div>
          </div>
        </motion.button>
        <motion.button whileTap={{ scale: 0.85 }} onTap={(e) => {
            e.stopPropagation();
            onToggleFav(preset.id);
          }}
          className="p-2 -mr-1 -mt-1"
        >
          <Heart
            size={18}
            className={isFav ? 'text-destructive fill-destructive' : 'text-muted-foreground'}
          />
        </motion.button>
      </div>
    </motion.div>
  );
});
