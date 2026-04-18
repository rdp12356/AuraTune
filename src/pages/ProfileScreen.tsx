import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContextCore';
import { useStats } from '@/hooks/useStats';
import { useTheme } from '@/context/ThemeContext';
import { achievementDefs } from '@/lib/achievements';
import { LogOut, Sun, Moon, Flame, Trophy, Clock, Zap, Sparkles, MessageSquare, Lock } from 'lucide-react';
import { useState } from 'react';
import FeedbackModal from '@/components/FeedbackModal';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { streak, achievements, totalMinutes, totalSessions } = useStats();
  const { theme, toggle } = useTheme();
  const [showFeedback, setShowFeedback] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen gradient-mesh pb-28 flex flex-col px-5 pt-12">
        <h1 className="text-2xl font-bold text-foreground mb-0.5">Profile</h1>
        <p className="text-sm text-muted-foreground mb-8">Settings & Achievements</p>

        <div className="glass rounded-2xl p-6 flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Trophy size={26} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Unlock Achievements</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in to earn achievements, save your favorite tracks, and sync across devices.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('guest_mode');
              window.location.href = '/';
            }}
            className="bg-primary text-primary-foreground px-6 py-3 w-full rounded-xl font-semibold glow-primary"
          >
            Create Free Account
          </button>
        </div>

        <motion.div className="glass rounded-2xl overflow-hidden">
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors active:bg-muted/40"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={16} className="text-foreground" /> : <Sun size={16} className="text-foreground" />}
              <span className="text-sm text-foreground">Dark Mode</span>
            </div>
            <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}>
              <motion.div animate={{ x: theme === 'dark' ? 20 : 0 }} className="w-5 h-5 rounded-full bg-card shadow-sm" />
            </div>
          </button>
          
          <div className="border-t border-border/30" />

          <button
            onClick={() => setShowFeedback(true)}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors active:bg-muted/40"
          >
            <MessageSquare size={16} className="text-foreground" />
            <span className="text-sm text-foreground">Send Feedback</span>
          </button>
        </motion.div>
        
        <FeedbackModal open={showFeedback} onClose={() => setShowFeedback(false)} />
      </div>
    );
  }

  const unlockedKeys = new Set(achievements.map(a => a.achievement_key));

  return (
    <div className="min-h-screen gradient-mesh pb-28">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your journey</p>
      </div>

      <div className="px-5 space-y-4">
        {/* User card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center text-2xl">
              🧠
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground truncate">{user.user_metadata?.full_name || user.user_metadata?.name || 'AuraTune User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Flame size={12} className="text-warm" />
                  {streak?.current_streak ?? 0} day streak
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Zap size={12} className="text-accent" />
                  {totalSessions} sessions
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 grid grid-cols-3 gap-4 text-center"
        >
          <div>
            <div className="w-10 h-10 rounded-full bg-warm/10 flex items-center justify-center mx-auto mb-2">
              <Flame size={18} className="text-warm" />
            </div>
            <p className="text-xl font-bold text-foreground">{streak?.current_streak ?? 0}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Current Streak</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
              <Trophy size={18} className="text-accent" />
            </div>
            <p className="text-xl font-bold text-foreground">{streak?.longest_streak ?? 0}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Best Streak</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Clock size={18} className="text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">{Math.floor(totalMinutes / 60)}h</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total Time</p>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Achievements</h3>
            <span className="text-[10px] text-muted-foreground ml-auto bg-muted/50 px-2 py-0.5 rounded-full">
              {unlockedKeys.size}/{achievementDefs.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {achievementDefs.map((ach) => {
              const unlocked = unlockedKeys.has(ach.key);
              return (
                <motion.div
                  key={ach.key}
                  whileTap={{ scale: 0.97 }}
                  className={`rounded-xl p-3.5 transition-all ${
                    unlocked
                      ? 'glass border-primary/20'
                      : 'bg-muted/20 opacity-35'
                  }`}
                >
                  <span className="text-xl">{ach.icon}</span>
                  <p className="text-xs font-medium text-foreground mt-1.5">{ach.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{ach.description}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-border/30">
            <Sparkles size={12} className="text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">More achievements coming soon</p>
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors active:bg-muted/40"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={16} className="text-foreground" /> : <Sun size={16} className="text-foreground" />}
              <span className="text-sm text-foreground">Dark Mode</span>
            </div>
            <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}>
              <motion.div
                animate={{ x: theme === 'dark' ? 20 : 0 }}
                className="w-5 h-5 rounded-full bg-card shadow-sm"
              />
            </div>
          </button>

          <div className="border-t border-border/30" />

          <button
            onClick={() => navigate('/reset-password')}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors active:bg-muted/40"
          >
            <Lock size={16} className="text-foreground" />
            <span className="text-sm text-foreground">Change Password</span>
          </button>

          <div className="border-t border-border/30" />

          <button
            onClick={() => setShowFeedback(true)}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors active:bg-muted/40"
          >
            <MessageSquare size={16} className="text-foreground" />
            <span className="text-sm text-foreground">Send Feedback</span>
          </button>

          <div className="border-t border-border/30" />

          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors active:bg-destructive/10"
          >
            <LogOut size={16} className="text-destructive" />
            <span className="text-sm text-destructive">Sign Out</span>
          </button>
        </motion.div>
      </div>

      <FeedbackModal open={showFeedback} onClose={() => setShowFeedback(false)} />
    </div>
  );
}
