import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContextCore';

export function useStats() {
  const { user } = useAuth();

  const sessionsQuery = useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
    refetchOnMount: 'always',
    staleTime: 1000 * 30, // 30 seconds — refresh frequently after sessions
  });

  const streakQuery = useQuery({
    queryKey: ['streak', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
    refetchOnMount: 'always',
    staleTime: 1000 * 30,
  });

  const achievementsQuery = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);
      return data ?? [];
    },
    enabled: !!user,
    refetchOnMount: 'always',
    staleTime: 1000 * 30,
  });

  const sessions = sessionsQuery.data ?? [];
  
  const totalMinutes = Math.round(sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60);
  
  const todaySessions = sessions.filter(s => {
    const d = new Date(s.started_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const todayMinutes = Math.round(todaySessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60);

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  sessions.forEach(s => {
    categoryMap[s.category] = (categoryMap[s.category] || 0) + (s.duration_seconds || 0);
  });
  const categoryBreakdown = Object.entries(categoryMap)
    .map(([name, seconds]) => ({ name, minutes: Math.round(seconds / 60) }))
    .sort((a, b) => b.minutes - a.minutes);

  // Weekly data (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    const dayMins = sessions
      .filter(s => new Date(s.started_at).toDateString() === dateStr)
      .reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      minutes: Math.round(dayMins / 60),
    };
  });

  return {
    sessions,
    totalMinutes,
    todayMinutes,
    totalSessions: sessions.length,
    categoryBreakdown,
    weeklyData,
    streak: streakQuery.data,
    achievements: achievementsQuery.data ?? [],
    loading: sessionsQuery.isLoading,
  };
}
