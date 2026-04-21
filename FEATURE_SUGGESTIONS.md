# AuraTune Feature Suggestions

Based on codebase review, here are recommended features organized by priority:

## High Priority Features

### 1. Offline Mode / Download for Premium Users
**Why:** Users want to listen without internet, especially during travel.
**Implementation:**
- Cache audio generation parameters locally
- Store session history in IndexedDB when offline
- Sync when connection restored

### 2. Custom Frequency Builder
**Why:** Users may want specific frequencies not in presets.
**Implementation:**
- Add new page `/custom-frequency`
- Sliders for carrierHz (100-500Hz) and beatHz (1-40Hz)
- Save custom presets to user profile
- Store in Supabase `custom_presets` table

### 3. Sleep Timer with Fade Out
**Why:** Current timer stops abruptly; users want gradual fade.
**Implementation:**
- Modify `audioEngine.ts` to support fade duration parameter
- Add 1-minute fade-out before timer ends
- Option in PlayerScreen settings tab

### 4. Session History & Replay
**Why:** Users want to see past sessions and replay favorite combinations.
**Implementation:**
- New API: `useSessionHistory()` hook
- New page or section in Stats: "Recent Sessions"
- Show: date, preset, duration, background sound
- One-tap "Replay Session" button

### 5. Smart Alarm / Wake-up
**Why:** Users use sleep frequencies and need gentle wake-up.
**Implementation:**
- Add alarm time selector in PlayerScreen
- Schedule wake-up with gradually increasing frequency
- Use Web Audio API to transition from delta to beta waves
- Background mode notification for alarm

## Medium Priority Features

### 6. Breathing Exercise Integration
**Why:** Combine binaural beats with guided breathing.
**Implementation:**
- Add "breathe" category with 4-7-8, box breathing patterns
- Visual breathing circle animation
- Sync breathing cues with audio
- New presets: "Breath Sync", "Pranayama"

### 7. Playlist / Queue System
**Why:** Users want seamless transitions between frequencies.
**Implementation:**
- Add queue to PlayerContext state
- Auto-advance when timer completes
- Drag-and-drop reorder in PlayerScreen
- Save playlists to user profile

### 8. Focus Timer Integration with Break Reminders
**Why:** Pomodoro-style work sessions are popular.
**Implementation:**
- Enhance existing `smartRoutines`
- Add break timer that switches to relax frequencies
- Notification when break starts
- Track focus vs break time separately

### 9. Social Sharing & Achievements
**Why:** Users want to share progress and compete.
**Implementation:**
- Share card generation for milestones
- Weekly listening stats image
- Optional public profile with achievements
- Friends system (requires new Supabase tables)

### 10. Voice Guidance / Guided Meditations
**Why:** Beginners need guidance.
**Implementation:**
- Add optional voice tracks (load as audio files)
- Presets with voice: "Guided Sleep", "Body Scan"
- Volume mix between voice and binaural beats

## Lower Priority Features

### 11. Widget for Mobile Home Screen
**Why:** Quick access to start favorite presets.
**Implementation:**
- Capacitor widget plugin integration
- Show favorite presets in widget
- Quick play/pause from widget

### 12. Apple Watch / Wear OS Support
**Why:** Convenient controls without phone.
**Implementation:**
- Add Capacitor watch plugin
- Basic play/pause controls
- Show current preset name
- Heart rate display during session

### 13. Ambient Sound Mixer
**Why:** Users want to combine multiple background sounds.
**Implementation:**
- Allow selection of 2-3 background sounds
- Individual volume controls per sound
- Mix: Rain + Wind, Ocean + Birds

### 14. Daily Streak Reminder Notifications
**Why:** Encourage daily habit formation.
**Implementation:**
- Schedule local notifications via Capacitor
- Remind at user-preferred time
- Show current streak in notification

### 15. Import/Export Data
**Why:** Users want data portability and backup.
**Implementation:**
- Export: JSON with sessions, favorites, achievements
- Import: Restore from backup file
- Option in Profile settings

## Technical Improvements

### Performance Enhancements
1. **Audio Worklet Migration** - Move audio processing off main thread
2. **Virtual List for Session History** - Handle large history efficiently
3. **Image Optimization** - Add WebP support with fallbacks

### Accessibility Improvements
1. **Screen Reader Support** - Add proper ARIA labels throughout
2. **Reduced Motion Mode** - Respect `prefers-reduced-motion`
3. **High Contrast Theme** - Additional theme option

### Security Enhancements
1. **Rate Limiting** - Protect achievement unlocks from spam
2. **Input Sanitization** - Validate all user inputs server-side
3. **Row Level Security** - Review Supabase RLS policies

## Database Schema Additions

```sql
-- Custom user presets
CREATE TABLE custom_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  carrier_hz integer NOT NULL,
  beat_hz integer NOT NULL,
  wave_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Playlists
CREATE TABLE playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE playlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE,
  preset_id text NOT NULL,
  order_index integer NOT NULL,
  timer_seconds integer
);

-- Device sync
CREATE TABLE user_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name text,
  last_sync_at timestamptz DEFAULT now()
);
```

## Implementation Priority Matrix

| Feature | User Value | Dev Effort | Priority |
|---------|------------|------------|----------|
| Sleep Timer Fade | High | Low | P1 |
| Custom Frequency | High | Medium | P1 |
| Session History | High | Medium | P1 |
| Offline Mode | High | High | P2 |
| Smart Alarm | Medium | Medium | P2 |
| Breathing | Medium | Medium | P2 |
| Playlist | Medium | High | P3 |
| Social Features | Low | High | P4 |
| Voice Guidance | Medium | High | P3 |
| Widget | Low | Medium | P4 |

## Next Steps

1. **Immediate (Week 1):**
   - Implement fade-out timer
   - Add session history view

2. **Short-term (Month 1):**
   - Build custom frequency creator
   - Add breathing exercises
   - Improve offline support

3. **Medium-term (Quarter):**
   - Playlist/queue system
   - Smart alarm feature
   - Social sharing

4. **Long-term (6 months):**
   - Wearable support
   - Voice guidance library
   - Advanced analytics
