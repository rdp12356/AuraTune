import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContextCore';
import { useQueryClient } from '@tanstack/react-query';

export interface AchievementUnlock {
  key: string;
  name: string;
  description: string;
  icon: string;
}

const ACHIEVEMENT_META: Record<string, { name: string; description: string; icon: string }> = {
  first_session: { name: 'First Frequency', description: 'Complete your first session', icon: '🎵' },
  hour_1: { name: 'One Hour Club', description: 'Listen for 1 total hour', icon: '⏱️' },
  hour_5: { name: 'Five Hour Flow', description: 'Listen for 5 total hours', icon: '🔥' },
  streak_3: { name: '3-Day Streak', description: 'Maintain a 3-day streak', icon: '🔗' },
  streak_7: { name: 'Weekly Warrior', description: 'Maintain a 7-day streak', icon: '⚡' },
  streak_14: { name: 'Two Week Titan', description: 'Maintain a 14-day streak', icon: '💎' },
  streak_30: { name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '👑' },
  all_categories: { name: 'Explorer', description: 'Try all frequency categories', icon: '🌍' },
  night_owl: { name: 'Night Owl', description: 'Start a session after midnight', icon: '🦉' },
  early_bird: { name: 'Early Bird', description: 'Start a session before 6 AM', icon: '🐦' },
};

type UnlockCallback = (achievement: AchievementUnlock) => void;

let globalOnUnlock: UnlockCallback | null = null;

export function setAchievementUnlockCallback(cb: UnlockCallback | null) {
  globalOnUnlock = cb;
}

export function useAchievementChecker() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const checkAndUnlock = useCallback(async () => {
    if (!user) return;

    // Get existing achievements
    const { data: existing } = await supabase
      .from('achievements')
      .select('achievement_key')
      .eq('user_id', user.id);

    const unlocked = new Set((existing ?? []).map(a => a.achievement_key));

    // Get sessions
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id);

    const allSessions = sessions ?? [];
    const totalSeconds = allSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);

    // Get streak
    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const toUnlock: string[] = [];

    // first_session: at least 1 session with duration > 0
    if (!unlocked.has('first_session') && allSessions.some(s => (s.duration_seconds || 0) > 5)) {
      toUnlock.push('first_session');
    }

    // hour_1
    if (!unlocked.has('hour_1') && totalSeconds >= 3600) {
      toUnlock.push('hour_1');
    }

    // hour_5
    if (!unlocked.has('hour_5') && totalSeconds >= 18000) {
      toUnlock.push('hour_5');
    }

    // streak achievements
    const currentStreak = streak?.current_streak ?? 0;
    const longestStreak = streak?.longest_streak ?? 0;
    const bestStreak = Math.max(currentStreak, longestStreak);

    if (!unlocked.has('streak_3') && bestStreak >= 3) toUnlock.push('streak_3');
    if (!unlocked.has('streak_7') && bestStreak >= 7) toUnlock.push('streak_7');
    if (!unlocked.has('streak_14') && bestStreak >= 14) toUnlock.push('streak_14');
    if (!unlocked.has('streak_30') && bestStreak >= 30) toUnlock.push('streak_30');

    // all_categories
    const cats = new Set(allSessions.map(s => s.category));
    if (!unlocked.has('all_categories') && ['focus', 'sleep', 'meditation', 'exercise', 'relax'].every(c => cats.has(c))) {
      toUnlock.push('all_categories');
    }

    // night_owl: session started after midnight (0:00-4:00)
    if (!unlocked.has('night_owl') && allSessions.some(s => {
      const h = new Date(s.started_at).getHours();
      return h >= 0 && h < 4;
    })) {
      toUnlock.push('night_owl');
    }

    // early_bird: session started before 6 AM (4:00-6:00)
    if (!unlocked.has('early_bird') && allSessions.some(s => {
      const h = new Date(s.started_at).getHours();
      return h >= 4 && h < 6;
    })) {
      toUnlock.push('early_bird');
    }

    // Insert new achievements
    for (const key of toUnlock) {
      await supabase.from('achievements').insert({
        user_id: user.id,
        achievement_key: key,
      });

      const meta = ACHIEVEMENT_META[key];
      if (meta && globalOnUnlock) {
        globalOnUnlock({ key, ...meta });
      }
    }

    if (toUnlock.length > 0) {
      queryClient.invalidateQueries({ queryKey: ['achievements', user.id] });
    }
  }, [user, queryClient]);

  return { checkAndUnlock };
}
