import { useEffect, useRef } from 'react';
import { usePlayerState } from '@/context/PlayerContextCore';
import { useAuth } from '@/context/AuthContextCore';
import { supabase } from '@/integrations/supabase/client';
import { useAchievementChecker } from '@/hooks/useAchievementChecker';

export function useSessionTracker() {
  const { preset, isPlaying, elapsed } = usePlayerState();
  const { user } = useAuth();
  const { checkAndUnlock } = useAchievementChecker();
  
  const sessionIdRef = useRef<string | null>(null);
  const lastPresetRef = useRef<string | null>(null);
  const isStartingRef = useRef(false);
  const elapsedRef = useRef(elapsed);
  const wasPlayingRef = useRef(false);

  // Keep elapsedRef in sync without triggering effects
  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  // Start session when playing begins
  useEffect(() => {
    if (!user || !preset || !isPlaying) return;
    
    // Prevent double starts
    if (isStartingRef.current) return;
    if (lastPresetRef.current === preset.id && sessionIdRef.current) return;

    const startSession = async () => {
      isStartingRef.current = true;
      try {
        const { data, error } = await supabase
          .from('sessions')
          .insert({
            user_id: user.id,
            preset_id: preset.id,
            preset_name: preset.name,
            category: preset.category,
            duration_seconds: 0,
          })
          .select('id')
          .single();
        
        if (error) throw error;
        if (data) {
          sessionIdRef.current = data.id;
          lastPresetRef.current = preset.id;
        }
      } catch (err) {
        console.error('Failed to start session:', err);
      } finally {
        isStartingRef.current = false;
      }
    };

    startSession();
    wasPlayingRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, preset?.id, isPlaying]);

  // Update duration periodically
  useEffect(() => {
    if (!user || !isPlaying) return;

    const interval = setInterval(async () => {
      if (!sessionIdRef.current) return;

      try {
        await supabase
          .from('sessions')
          .update({ 
            duration_seconds: elapsedRef.current, 
            ended_at: new Date().toISOString() 
          })
          .eq('id', sessionIdRef.current);
      } catch (err) {
        console.error('Failed to update session duration:', err);
      }
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isPlaying]);

  // Finalize on stop — use wasPlayingRef to detect the transition
  useEffect(() => {
    // Detect transition from playing → stopped
    if (wasPlayingRef.current && !isPlaying) {
      wasPlayingRef.current = false;

      const sid = sessionIdRef.current;
      const uid = user?.id;
      const dur = elapsedRef.current;

      if (sid && uid && dur > 0) {
        const finalizeSession = async () => {
          try {
            await supabase
              .from('sessions')
              .update({ 
                duration_seconds: dur, 
                ended_at: new Date().toISOString() 
              })
              .eq('id', sid);
            
            await updateStreak(uid);
            await checkAndUnlock();
          } catch (err) {
            console.error('Failed to finalize session:', err);
          }
        };

        finalizeSession();
      }

      sessionIdRef.current = null;
      lastPresetRef.current = null;
    }

    if (isPlaying) {
      wasPlayingRef.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);
}

async function updateStreak(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: existing } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!existing) {
    await supabase.from('streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_session_date: today,
    });
    return;
  }

  if (existing.last_session_date === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = 1;
  if (existing.last_session_date === yesterdayStr) {
    newStreak = existing.current_streak + 1;
  }

  await supabase
    .from('streaks')
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, existing.longest_streak),
      last_session_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
}
