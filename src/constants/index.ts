// App Constants

export const APP_NAME = 'AuraTune';
export const APP_VERSION = '1.0.0';

// Storage Keys
export const STORAGE_KEYS = {
  THEME: 'ff-theme',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  GUEST_MODE: 'guest_mode',
} as const;

// Audio Constants
export const AUDIO_CONFIG = {
  FADE_DURATION: 0.1, // 100ms
  FREQUENCY_LOUDNESS_BOOST: 1.55,
  DEFAULT_VOLUME: 0.68,
  DEFAULT_BG_VOLUME: 0.55,
  HEARTBEAT_INTERVAL: 8000, // 8 seconds
} as const;

// Session Tracking
export const SESSION_CONFIG = {
  UPDATE_INTERVAL: 30000, // 30 seconds
  MIN_DURATION_FOR_STREAK: 60, // 1 minute
} as const;

// Query Stale Times
export const QUERY_STALE_TIME = {
  DEFAULT: 1000 * 60 * 5, // 5 minutes
  STATS: 1000 * 30, // 30 seconds
  ACHIEVEMENTS: 1000 * 60, // 1 minute
} as const;

// Animation Durations
export const ANIMATION = {
  FAST: 0.15,
  NORMAL: 0.3,
  SLOW: 0.5,
  STAGGER: 0.08,
} as const;

// Social Links
export const SOCIAL_LINKS = {
  SUPPORT_EMAIL: 'adithyashyam1@gmail.com',
  SUPPORT_EMAIL_2: 'johanmanoj2009@gmail.com',
  PRIVACY_EMAIL: 'adithyashyam1@gmail.com',
  PRIVACY_EMAIL_2: 'johanmanoj2009@gmail.com',
  PRIVACY_URL: '#',
  TERMS_URL: '#',
} as const;

// Achievements
export const ACHIEVEMENT_THRESHOLDS = {
  FIRST_SESSION: { hours: 0, minutes: 1 },
  HOUR_1: { hours: 1, minutes: 0 },
  HOUR_5: { hours: 5, minutes: 0 },
  STREAK_3: 3,
  STREAK_7: 7,
  STREAK_14: 14,
  STREAK_30: 30,
} as const;
