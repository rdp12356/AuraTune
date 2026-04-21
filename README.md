# 🎧 AuraTune

[![Play Store](https://img.shields.io/badge/Google%20Play-Install-brightgreen?logo=googleplay)](https://play.google.com/store/apps)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Scientifically-tuned binaural beats & solfeggio frequencies to help you focus, sleep deeper, meditate, and boost energy.**

AuraTune combines ancient sound healing wisdom with modern neuroscience, delivering a beautifully designed audio experience that adapts to your mood and goals.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **Smart Focus Presets** | Beta waves (14-30Hz) scientifically proven to enhance concentration and productivity |
| 🌙 **Deep Sleep Frequencies** | Delta waves (0.5-4Hz) for restorative sleep and physical recovery |
| 🧘 **Meditation Modes** | Theta waves (4-8Hz) to access deeper states of consciousness |
| ⚡ **Energy Boosting** | Gamma waves (40Hz+) for peak cognitive performance and alertness |
| 🔊 **Immersive Background Sounds** | Rain, Ocean, Forest, and White Noise layers |
| ⏱️ **Smart Timers** | Pomodoro, Deep Work, and custom duration presets |
| 📊 **Progress Tracking** | Session stats, streaks, and weekly listening analytics |
| 💾 **Cloud Sync** | Secure Supabase backend to sync your favorites and progress across devices |
| 🌙 **Dark Mode** | Easy on the eyes for late-night listening sessions |

---

## 📱 Screenshots

<p align="center">
  <img src="docs/screenshots/home-screen.png" width="200" alt="Home Screen" />
  <img src="docs/screenshots/player-screen.png" width="200" alt="Player Screen" />
  <img src="docs/screenshots/stats-screen.png" width="200" alt="Stats Screen" />
  <img src="docs/screenshots/profile-screen.png" width="200" alt="Profile Screen" />
</p>

*📸 Add your screenshots to `docs/screenshots/` folder before publishing*

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or bun
- Android Studio (for mobile builds)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/auratune.git
cd auratune

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

Visit `http://localhost:8080` to see the app.

---

## 🛠️ Building for Production

### Web Build

```bash
npm run build
```

### Android Build (for Google Play)

```bash
# Build the web assets
npm run build

# Sync with Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

#### Signing Configuration

Before creating a release build, configure your signing credentials:

1. Create `android/local.properties`:
```properties
AURATUNE_KEYSTORE_PASSWORD=your_keystore_password
AURATUNE_KEY_PASSWORD=your_key_password
```

2. In Android Studio: **Build → Generate Signed Bundle/APK → Android App Bundle**

3. Upload the `.aab` file to Google Play Console

---

## 📋 Google Play Store Checklist

Before publishing, ensure you've completed the following:

### Required Assets
- [ ] **App Icon**: 512x512 PNG (already configured in `android/app/src/main/res/`)
- [ ] **Feature Graphic**: 1024x500 PNG (add to `docs/store-assets/`)
- [ ] **Screenshots**: Phone (min 2, max 8) and Tablet (optional)
- [ ] **Video Trailer**: 30-60 seconds (optional but recommended)
- [ ] **Privacy Policy**: Link to hosted privacy policy
- [ ] **Content Rating**: Complete the questionnaire in Play Console

### Store Listing Optimization
- [ ] **Title**: AuraTune: Binaural Beats & Focus (max 50 chars)
- [ ] **Short Description**: Powerful binaural beats for focus, sleep & relaxation. (max 80 chars)
- [ ] **Full Description**: See `docs/play-store-description.txt`
- [ ] **App Category**: Health & Fitness
- [ ] **Tags**: binaural beats, meditation, focus, sleep, relaxation, mindfulness

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Framer Motion |
| **UI Components** | Radix UI, shadcn/ui |
| **State Management** | React Context, TanStack Query |
| **Mobile** | Capacitor 8, Android SDK 36 |
| **Backend** | Supabase (Auth, PostgreSQL) |
| **Audio Engine** | Web Audio API with custom binaural generator |

---

## 🔐 Privacy & Security

- ✅ **No audio data leaves your device** - All frequency generation happens locally
- ✅ **Encrypted cloud sync** - Supabase Row Level Security protects your data
- ✅ **No third-party analytics** - Your listening habits stay private
- ✅ **GDPR compliant** - Full data export and deletion support

Read our full [Privacy Policy](PRIVACY_POLICY.md)

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npx playwright test
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Binaural beat research based on studies by Dr. Gerald Oster and the Monroe Institute
- Solfeggio frequencies rooted in ancient Gregorian chants
- UI inspired by the best in class meditation and productivity apps

---

<p align="center">
  Made with ❤️ for better focus and deeper sleep
</p>

<p align="center">
  <a href="https://play.google.com/store/apps">
    <img src="docs/store-assets/google-play-badge.png" width="200" alt="Get it on Google Play" />
  </a>
</p>
