import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BarChart3,
  Clock,
  Flame,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { useAuth } from '@/context/AuthContextCore';
import { useStats } from '@/hooks/useStats';

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-4 animate-pulse">
      <div className="h-3 w-16 bg-muted rounded mb-3" />
      <div className="h-7 w-12 bg-muted rounded mb-1" />
      <div className="h-2 w-10 bg-muted rounded" />
    </div>
  );
}

export default function StatsScreen() {
  const { user } = useAuth();
  const { totalMinutes, todayMinutes, totalSessions, categoryBreakdown, weeklyData, streak, loading } = useStats();

  if (!user) {
    return (
      <div className="min-h-screen gradient-mesh flex flex-col items-center justify-center px-5 pb-20">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <BarChart3 size={28} />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Track Your Focus</h3>
        <p className="text-sm text-muted-foreground text-center max-w-[260px] mb-8">
          Sign in or create an account to view your detailed listening stats, streaks, and progress.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('guest_mode');
            window.location.href = '/';
          }}
          className="bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold glow-primary"
        >
          Sign In / Sign Up
        </button>
      </div>
    );
  }

  const formatHours = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  // Check if streak might reset today
  const streakWarning = streak && streak.current_streak > 0 && streak.last_session_date !== new Date().toISOString().split('T')[0];

  const isEmpty = totalSessions === 0;

  return (
    <div className="min-h-screen gradient-mesh pb-28">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Your Stats</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track your progress</p>
      </div>

      {loading ? (
        <div className="px-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
          <div className="glass rounded-2xl p-4 animate-pulse h-52" />
        </div>
      ) : isEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 flex flex-col items-center justify-center py-20"
        >
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <BarChart3 size={28} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No stats yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Start your first session to see your listening stats, streaks, and progress here.
          </p>
        </motion.div>
      ) : (
        <div className="px-5 space-y-4">
          {/* Streak warning */}
          {streakWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-2xl bg-warm/10 border border-warm/20 px-4 py-3"
            >
              <AlertTriangle size={16} className="text-warm flex-shrink-0" />
              <p className="text-xs text-foreground">
                <span className="font-semibold">Your streak will reset today</span> if you don't listen!
              </p>
            </motion.div>
          )}

          {/* Top stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Flame size={18} className="text-warm" />}
              label="Streak"
              value={`${streak?.current_streak ?? 0}`}
              sub="days"
              delay={0}
            />
            <StatCard
              icon={<Clock size={18} className="text-primary" />}
              label="Today"
              value={formatHours(todayMinutes)}
              sub="listened"
              delay={0.05}
            />
            <StatCard
              icon={<Zap size={18} className="text-accent" />}
              label="Total Sessions"
              value={`${totalSessions}`}
              sub="completed"
              delay={0.1}
            />
            <StatCard
              icon={<TrendingUp size={18} className="text-primary" />}
              label="Total Time"
              value={formatHours(totalMinutes)}
              sub="lifetime"
              delay={0.15}
            />
          </div>

          {/* Weekly chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-4"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4">This Week</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barCategoryGap="25%">
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
                    {weeklyData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === weeklyData.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Category breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-4"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4">By Category</h3>
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No sessions yet — start listening!</p>
            ) : (
              <div className="space-y-3.5">
                {categoryBreakdown.map((cat, i) => {
                  const max = categoryBreakdown[0].minutes || 1;
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-foreground capitalize font-medium">{cat.name}</span>
                        <span className="text-muted-foreground">{formatHours(cat.minutes)}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(cat.minutes / max) * 100}%` }}
                          transition={{ delay: 0.4 + i * 0.05, duration: 0.6 }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Streak info */}
          {streak && streak.longest_streak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-5 text-center"
            >
              <p className="text-xs text-muted-foreground mb-1">Longest streak</p>
              <p className="text-4xl font-bold text-foreground">{streak.longest_streak}</p>
              <p className="text-xs text-muted-foreground mt-1">days</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, delay }: {
  icon: React.ReactNode; label: string; value: string; sub: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-2.5">
        {icon}
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
    </motion.div>
  );
}
