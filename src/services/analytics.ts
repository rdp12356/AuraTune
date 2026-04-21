// Analytics Service
// Replace with your preferred analytics provider (Firebase, Amplitude, etc.)

type EventName =
  | 'session_started'
  | 'session_ended'
  | 'preset_played'
  | 'favorite_added'
  | 'favorite_removed'
  | 'achievement_unlocked'
  | 'auth_signup'
  | 'auth_signin'
  | 'auth_signout'
  | 'error_occurred'
  | 'screen_view';

interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

class AnalyticsService {
  private isEnabled = false;

  init() {
    // Initialize your analytics provider here
    // Example: firebase.analytics();
    this.isEnabled = true;
    console.log('[Analytics] Initialized');
  }

  track(eventName: EventName, params?: EventParams) {
    if (!this.isEnabled) return;

    try {
      // Replace with actual analytics tracking
      // Example: firebase.analytics().logEvent(eventName, params);
      console.log('[Analytics]', eventName, params);
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }

  trackScreen(screenName: string, screenClass?: string) {
    this.track('screen_view', {
      screen_name: screenName,
      screen_class: screenClass,
    });
  }

  setUserProperties(properties: Record<string, string | number | boolean>) {
    if (!this.isEnabled) return;

    try {
      // Set user properties
      console.log('[Analytics] User properties:', properties);
    } catch (error) {
      console.error('[Analytics] Failed to set user properties:', error);
    }
  }
}

export const analytics = new AnalyticsService();
