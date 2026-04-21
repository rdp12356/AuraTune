# AuraTune - Build Instructions for Google Play Store

## Prerequisites

- Node.js 18 or higher
- Android Studio (latest version)
- JDK 17 or higher
- A physical Android device for testing (recommended)

---

## Step 1: Environment Setup

### 1.1 Install Dependencies

```bash
cd /path/to/AuraTune
npm install
```

### 1.2 Configure Environment Variables

Create a `.env` file (already exists, but verify):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

### 1.3 Configure Android Signing

Create `android/local.properties` (DO NOT COMMIT THIS FILE):

```properties
AURATUNE_KEYSTORE_PASSWORD=your_secure_password
AURATUNE_KEY_PASSWORD=your_key_password
```

**Note:** If you don't have a keystore yet, see "Creating a Keystore" below.

---

## Step 2: Build the Web App

```bash
# Build for production
npm run build

# Verify build output exists
ls -la dist/
```

---

## Step 3: Sync with Android

```bash
# Sync Capacitor with Android project
npx cap sync android

# Copy web assets to Android
npx cap copy android
```

---

## Step 4: Open in Android Studio

```bash
npx cap open android
```

Or manually open the `android/` folder in Android Studio.

---

## Step 5: Build Release APK/AAB

### 5.1 Using Android Studio GUI

1. In Android Studio, go to **Build → Generate Signed Bundle / APK**
2. Select **Android App Bundle (.aab)**
3. Click **Create new** or select existing keystore
4. Fill in keystore details:
   - Key store path: `android/app/release.keystore`
   - Key store password: (from local.properties)
   - Key alias: `aura-tune`
   - Key password: (from local.properties)
5. Select `release` build variant
6. Click **Finish**

### 5.2 Using Command Line

```bash
cd android

# Build release APK
./gradlew assembleRelease

# Build release AAB (for Play Store)
./gradlew bundleRelease
```

**Output locations:**
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Step 6: Test the Release Build

### 6.1 Install on Device

```bash
# Install APK on connected device
adb install android/app/build/outputs/apk/release/app-release.apk

# Or drag-and-drop APK to Android Emulator
```

### 6.2 Test Checklist

Before uploading to Play Store, verify:

- [ ] App launches without crashes
- [ ] All screens load correctly
- [ ] Audio plays with headphones
- [ ] Background playback works
- [ ] Timer functionality works
- [ ] Login/Signup works (if testing cloud features)
- [ ] Dark mode toggles correctly
- [ ] No debug overlays or logs visible

---

## Step 7: Upload to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app or select existing
3. Go to **Release → Production → Create new release**
4. Upload your `.aab` file
5. Add release notes
6. Review and rollout

---

## Creating a Keystore (First Time Only)

If you don't have a keystore file, create one:

```bash
cd android/app

# Generate new keystore
keytool -genkey -v -keystore release.keystore -alias aura-tune -keyalg RSA -keysize 2048 -validity 10000

# When prompted:
# - Enter keystore password: [create secure password]
# - Re-enter password: [same password]
# - What is your first and last name? [Your Name]
# - What is the name of your organizational unit? [Optional]
# - What is the name of your organization? [Optional]
# - What is the name of your City or Locality? [Your City]
# - What is the name of your State or Province? [Your State]
# - What is the two-letter country code for this unit? [US]
# - Is CN=... correct? [yes]
# - Enter key password for aura-tune: [can use same as keystore]
```

**⚠️ CRITICAL:** Back up your `release.keystore` file and passwords. If you lose them, you cannot update your app on Google Play.

---

## Troubleshooting

### Build Failed: Keystore not found

```
Execution failed for task ':app:packageRelease'.
> Keystore file 'android/app/release.keystore' not found
```

**Solution:** Create keystore (see above) or check the path in `build.gradle`.

### Build Failed: Environment variable not set

```
Could not get unknown property 'AURATUNE_KEYSTORE_PASSWORD'
```

**Solution:** Create `android/local.properties` with your credentials.

### App crashes on startup

**Check:**
1. Run `npx cap sync android` again
2. Check Android Studio logcat for errors
3. Verify all Capacitor plugins are installed
4. Check that `dist/` folder exists and has content

### Audio not playing

**Check:**
1. Verify headphones are connected (binaural beats require headphones)
2. Check Android permissions in `AndroidManifest.xml`
3. Verify Web Audio API is supported on test device

---

## Build Scripts

Add to `package.json` for convenience:

```json
{
  "scripts": {
    "build:android": "npm run build && npx cap sync android",
    "open:android": "npx cap open android",
    "release:android": "npm run build:android && cd android && ./gradlew bundleRelease"
  }
}
```

---

## Version Management

Update version in these files:

1. `package.json` - `version` field
2. `android/app/build.gradle`:
   - `versionCode` (must increment for each release)
   - `versionName` (human-readable version)

**Version Code Guidelines:**
- Format: `major * 10000 + minor * 100 + patch`
- Example: v1.2.3 = 10203
- Or simply increment: 1, 2, 3, 4...

---

## Additional Resources

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)

---

Happy publishing! 🚀
