# AuraTune

AuraTune is a modern, beautifully designed web app providing scientifically-backed binaural beats and solfeggio frequencies. It helps users improve focus, deepen sleep, meditate, and boost energy. Built with a buttery-smooth React UI, it features full offline caching, personalized frequency generation, background nature sounds, and deep stats tracking via Supabase.

---

## 🚀 Getting Started Locally

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

You will now be able to view the AuraTune application running locally at `http://localhost:8080`. Make sure you have your `.env` variables mapped if you want to test cloud saves!

---

## 📱 Publishing to the Google Play Store (Capacitor)

AuraTune is fully integrated with **Capacitor**, meaning you can effortlessly wrap this web application into a native Android App Bundle (`.aab`) to publish directly on the Google Play Store.

### Prerequisites

- Install [Android Studio](https://developer.android.com/studio) to your machine.
- Have a verified [Google Play Developer Console](https://play.google.com/console) account.

### Step 1: Build the Web App

Before generating the Android files, compile the production-ready React codebase:

```bash
npm run build
```

### Step 2: Initialize the Android Project

Generate the necessary native Android codebase (if you haven't already):

```bash
npx cap add android
```

*(Note: If the `android/` directory already exists, run `npx cap sync android` instead to push your latest web build into the mobile app container).*

### Step 3: Open in Android Studio

Launch Android Studio with your localized project:

```bash
npx cap open android
```

### Step 4: Configure App Details inside Android Studio

1. Navigate to `app/res/values/strings.xml` to rename your app.
2. In `app/build.gradle`, locate `applicationId` and ensure it matches the unique ID you want on the Play Store (e.g. `com.auratune.app`).
3. Update the app icons inside the `app/res/` drawable folders using the **Image Asset Studio** built into Android Studio.

### Step 5: Build the Signed App Bundle (.aab)

To upload to the Play Store, you need a signed App Bundle:

1. In Android Studio, click **Build > Generate Signed Bundle / APK** from the top menu.
2. Select **Android App Bundle**.
3. Create a new Keystore (or choose an existing one). Fill in your passwords and certificate details. **(CRITICAL: Do not lose your keystore file or password; you need it for all future app updates!)**
4. Select the `release` build variant and hit Finish.

You will now find your `app-release.aab` file generated in the destination folder.

### Step 6: Publish on Google Play

Navigate to the [Google Play Console](https://play.google.com/console), define your store listing, answer the required data safety questionnaires, and finally upload the `.aab` file you just generated to the Production track.

---

## 🛠 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Native Wrapper:** Capacitor (`@capacitor/core`, `@capacitor/android`)
- **Backend & Auth:** Supabase Auth & PostgreSQL
- **Audio Engine:** Web Audio API (Dynamic Oscillators)
