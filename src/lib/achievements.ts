export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export const achievementDefs: AchievementDef[] = [
  { key: 'first_session', name: 'First Frequency', description: 'Complete your first session', icon: '🎵' },
  { key: 'hour_1', name: 'One Hour Club', description: 'Listen for 1 total hour', icon: '⏱️' },
  { key: 'hour_5', name: 'Five Hour Flow', description: 'Listen for 5 total hours', icon: '🔥' },
  { key: 'streak_3', name: '3-Day Streak', description: 'Maintain a 3-day streak', icon: '🔗' },
  { key: 'streak_7', name: 'Weekly Warrior', description: 'Maintain a 7-day streak', icon: '⚡' },
  { key: 'streak_14', name: 'Two Week Titan', description: 'Maintain a 14-day streak', icon: '💎' },
  { key: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '👑' },
  { key: 'all_categories', name: 'Explorer', description: 'Try all frequency categories', icon: '🌍' },
  { key: 'night_owl', name: 'Night Owl', description: 'Start a session after midnight', icon: '🦉' },
  { key: 'early_bird', name: 'Early Bird', description: 'Start a session before 6 AM', icon: '🐦' },
];
