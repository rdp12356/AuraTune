export type Category = 'focus' | 'sleep' | 'meditation' | 'exercise' | 'relax';
export type Mood = 'stressed' | 'tired' | 'distracted' | 'calm' | 'unmotivated';

export interface FrequencyPreset {
  id: string;
  name: string;
  description: string;
  benefit: string;
  category: Category;
  carrierHz: number;
  beatHz: number;
  waveType: string;
  icon: string;
  color: 'primary' | 'warm' | 'accent';
  moods?: Mood[];
}

export const categories: { id: Category; label: string; icon: string; description: string }[] = [
  { id: 'focus', label: 'Focus', icon: '🎯', description: 'Sharpen concentration and boost productivity with Beta waves' },
  { id: 'sleep', label: 'Sleep', icon: '🌙', description: 'Drift into deep, restorative sleep with Delta frequencies' },
  { id: 'meditation', label: 'Meditate', icon: '🧘', description: 'Find inner stillness with Theta and Solfeggio tones' },
  { id: 'exercise', label: 'Exercise', icon: '⚡', description: 'Elevate your energy and peak physical performance' },
  { id: 'relax', label: 'Relax', icon: '🌊', description: 'Calm your nervous system and unwind naturally' },
];

export const moods: { id: Mood; label: string; icon: string; color: string }[] = [
  { id: 'stressed', label: 'Stressed', icon: '😰', color: 'destructive' },
  { id: 'tired', label: 'Tired', icon: '😴', color: 'warm' },
  { id: 'distracted', label: 'Distracted', icon: '🤯', color: 'accent' },
  { id: 'calm', label: 'Calm', icon: '😌', color: 'primary' },
  { id: 'unmotivated', label: 'Unmotivated', icon: '😔', color: 'muted' },
];

export const presets: FrequencyPreset[] = [
  // Focus (3 main)
  { id: 'beta-14', name: 'Deep Focus', description: '14Hz Beta waves for sustained concentration', benefit: 'Enhances concentration and reduces distractions', category: 'focus', carrierHz: 200, beatHz: 14, waveType: 'Beta', icon: '🎯', color: 'primary', moods: ['distracted', 'unmotivated'] },
  { id: 'beta-18', name: 'Flow State', description: '18Hz Beta for creative flow & productivity', benefit: 'Activates creative thinking and deep work mode', category: 'focus', carrierHz: 220, beatHz: 18, waveType: 'Beta', icon: '💡', color: 'primary', moods: ['unmotivated', 'distracted'] },
  { id: 'beta-12', name: 'Study Mode', description: '12Hz for learning & memory retention', benefit: 'Boosts memory retention and learning speed', category: 'focus', carrierHz: 180, beatHz: 12, waveType: 'Alpha-Beta', icon: '📚', color: 'primary', moods: ['distracted'] },
  
  // Sleep (3 main)
  { id: 'delta-4', name: 'Deep Sleep', description: '4Hz Delta for restorative deep sleep', benefit: 'Promotes deep sleep and physical recovery', category: 'sleep', carrierHz: 150, beatHz: 4, waveType: 'Delta', icon: '🌙', color: 'warm', moods: ['stressed', 'tired'] },
  { id: 'delta-2', name: 'Dreamless Rest', description: '2Hz Delta for profound unconscious rest', benefit: 'Induces the deepest stage of restorative sleep', category: 'sleep', carrierHz: 130, beatHz: 2, waveType: 'Delta', icon: '💤', color: 'warm', moods: ['tired'] },
  { id: 'theta-6', name: 'Drift Off', description: '6Hz Theta to ease into sleep', benefit: 'Gently transitions your mind into sleep', category: 'sleep', carrierHz: 160, beatHz: 6, waveType: 'Theta', icon: '🌜', color: 'warm', moods: ['stressed', 'tired'] },

  // Meditation (3 main)
  { id: 'theta-7', name: 'Zen Mind', description: '7Hz Theta for deep meditation', benefit: 'Deepens meditation and spiritual awareness', category: 'meditation', carrierHz: 170, beatHz: 7, waveType: 'Theta', icon: '🧘', color: 'accent', moods: ['stressed', 'calm'] },
  { id: 'alpha-10', name: 'Mindfulness', description: '10Hz Alpha for present awareness', benefit: 'Cultivates present-moment awareness', category: 'meditation', carrierHz: 200, beatHz: 10, waveType: 'Alpha', icon: '🕊️', color: 'accent', moods: ['stressed', 'distracted'] },
  { id: 'solf-528', name: '528Hz Love', description: 'Solfeggio frequency of transformation', benefit: 'Harmonizes body and mind at cellular level', category: 'meditation', carrierHz: 528, beatHz: 7, waveType: 'Solfeggio', icon: '💜', color: 'accent', moods: ['calm'] },

  // Exercise (3 main — added one)
  { id: 'gamma-40', name: 'Peak Power', description: '40Hz Gamma for peak physical performance', benefit: 'Maximizes power output and focus during workouts', category: 'exercise', carrierHz: 300, beatHz: 40, waveType: 'Gamma', icon: '⚡', color: 'primary', moods: ['unmotivated'] },
  { id: 'beta-20', name: 'Cardio Boost', description: '20Hz Beta for high-energy workouts', benefit: 'Elevates heart rate and workout intensity', category: 'exercise', carrierHz: 250, beatHz: 20, waveType: 'Beta', icon: '🏃', color: 'primary', moods: ['tired', 'unmotivated'] },
  { id: 'beta-25', name: 'Endurance', description: '25Hz Beta for sustained physical effort', benefit: 'Builds mental toughness for longer sessions', category: 'exercise', carrierHz: 270, beatHz: 25, waveType: 'Beta', icon: '🔥', color: 'primary', moods: ['unmotivated'] },

  // Relax (3 main — added one)
  { id: 'alpha-8', name: 'Calm Waves', description: '8Hz Alpha for gentle relaxation', benefit: 'Soothes anxiety and calms the nervous system', category: 'relax', carrierHz: 190, beatHz: 8, waveType: 'Alpha', icon: '🌊', color: 'primary', moods: ['stressed'] },
  { id: 'solf-432', name: '432Hz Harmony', description: 'Universal harmony frequency', benefit: 'Aligns your body with natural vibrations', category: 'relax', carrierHz: 432, beatHz: 6, waveType: 'Solfeggio', icon: '🎵', color: 'accent', moods: ['stressed', 'calm'] },
  { id: 'alpha-9', name: 'Serenity', description: '9Hz Alpha for peaceful tranquility', benefit: 'Creates a warm sense of inner peace', category: 'relax', carrierHz: 195, beatHz: 9, waveType: 'Alpha', icon: '🍃', color: 'accent', moods: ['stressed', 'tired'] },
];

export const backgroundSounds = [
  { id: 'none', name: 'None', icon: '🔇' },
  { id: 'rain', name: 'Rain', icon: '🌧️' },
  { id: 'ocean', name: 'Ocean', icon: '🌊' },
  { id: 'forest', name: 'Forest', icon: '🌲' },
  { id: 'wind', name: 'Wind', icon: '💨' },
];

export const timerPresets = [
  { label: '25m', value: 1500, description: 'Pomodoro' },
  { label: '45m', value: 2700, description: 'Deep Focus' },
  { label: '60m', value: 3600, description: 'One Hour' },
  { label: '90m', value: 5400, description: 'Deep Work' },
  { label: 'Sleep', value: 28800, description: '8 Hours' },
  { label: '∞', value: null, description: 'Infinite' },
];

export type SmartRoutine = 'pomodoro' | 'deep-work' | 'sleep';

export const smartRoutines: { id: SmartRoutine; name: string; icon: string; description: string; focusMinutes: number; breakMinutes: number; loops: number | null }[] = [
  { id: 'pomodoro', name: 'Pomodoro', icon: '🍅', description: '25 min focus / 5 min break', focusMinutes: 25, breakMinutes: 5, loops: 4 },
  { id: 'deep-work', name: 'Deep Work', icon: '🧠', description: '90 minutes uninterrupted', focusMinutes: 90, breakMinutes: 0, loops: 1 },
  { id: 'sleep', name: 'Sleep Mode', icon: '🌙', description: 'Gradual fade-out over time', focusMinutes: 60, breakMinutes: 0, loops: 1 },
];

export function getRecommendedPreset(mood: Mood): FrequencyPreset {
  const matches = presets.filter(p => p.moods?.includes(mood));
  return matches[0] || presets[0];
}

export function getRecommendedPresets(mood: Mood): FrequencyPreset[] {
  return presets.filter(p => p.moods?.includes(mood));
}
