# AuraTune - Play Store Asset Design Specifications

## Feature Graphic (Required)

**Dimensions:** 1024 x 500 pixels  
**Format:** PNG (24-bit) or JPG (no transparency)  
**Max Size:** 1 MB

### Design Guidelines

**Layout:**
- **Safe Zone:** Keep important content within 924 x 400px center
- **Left Side (60%):** App name, tagline, key visual
- **Right Side (40%):** Phone mockup or abstract visual

**Colors:**
- Primary Background: `#0D0D0E` (dark) or gradient
- Accent: `#8B5CF6` (purple) or `#10B981` (emerald)
- Text: White `#FFFFFF` for contrast

**Content:**
```
AURATUNE
Scientifically-Tuned Binaural Beats

[Visual: Headphones with sound waves or abstract frequency visualization]
```

**Tools:**
- Figma (recommended)
- Adobe Photoshop
- Canva (free alternative)

---

## Screenshots (Required)

### Phone Screenshots

**Required:** Minimum 2, Maximum 8  
**Recommended:** 5-6 screenshots  
**Dimensions:**
- Phone: 1080 x 1920 or 1920 x 1080 (16:9)
- Modern phones: 1080 x 2160 (2:1 ratio)

**Format:** PNG or JPG  
**Max Size:** 8 MB per screenshot

### Screenshot Content Suggestions

**Screenshot 1 - Home Screen:**
- Show the main categories (Focus, Sleep, Meditate, Energy)
- Include the mood selector
- Display "Use headphones" notice

**Screenshot 2 - Player Screen:**
- Active playing state with timer
- Brain animation visible
- Show preset details

**Screenshot 3 - Stats Screen:**
- Weekly chart visible
- Streak counter
- Category breakdown

**Screenshot 4 - Timer & Settings:**
- Timer presets
- Background sound selection
- Volume controls

**Screenshot 5 - Favorites/Profile:**
- Saved favorites
- User stats
- Settings options

**Screenshot 6 - Onboarding:**
- Beautiful onboarding flow
- App benefits
- Call to action

### Screenshot Best Practices

1. **Use Device Frames:**
   - Google Pixel frame (recommended)
   - Samsung Galaxy frame
   - Generic Android frame

2. **Add Text Overlays:**
   ```
   "Deep Focus"
   Beta waves for productivity
   
   "Better Sleep"
   Delta frequencies for rest
   
   "Track Progress"
   Build healthy habits
   ```

3. **Consistent Style:**
   - Same device frame across all screenshots
   - Consistent text positioning
   - Brand colors throughout

4. **Show Real Content:**
   - Use actual app data
   - Authentic-looking stats
   - Realistic session times

---

## Tablet Screenshots (Optional but Recommended)

**Dimensions:** 
- 7-inch: 1080 x 1920
- 10-inch: 1920 x 1200 or 2560 x 1600

**Content:**
- Same as phone screenshots
- Show responsive layout
- Highlight tablet-optimized UI

---

## App Icon (Already Configured)

**Location:** `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`

**Specifications:**
- Launcher: 512 x 512 px
- Play Store: 512 x 512 px
- Format: PNG (32-bit with alpha)

---

## Promo Video (Optional - High Impact)

**Duration:** 30-60 seconds  
**Format:** MP4 or WebM  
**Resolution:** 1080p (1920 x 1080)  
**File Size:** Max 100 MB

### Video Structure

**0-5s: Hook**
- "Struggling to focus?"
- "Can't sleep?"
- Problem statement

**5-20s: Solution**
- Show app interface
- Demonstrate key features
- Quick transitions between screens

**20-45s: Benefits**
- Text overlays with key benefits
- Stats/achievements
- User testimonials (if available)

**45-60s: Call to Action**
- "Download free on Google Play"
- App logo
- Play Store badge

### Video Best Practices

- **No audio required** (most users watch muted)
- **Large text** - readable on small screens
- **Fast pacing** - keep energy high
- **Brand colors** throughout
- **End card** with clear CTA

**Tools:**
- Adobe Premiere Pro
- Final Cut Pro
- Canva Video (free)
- InShot (mobile)

---

## Store Listing Text

### Title (50 chars)
```
AuraTune: Binaural Beats & Focus
```

### Short Description (80 chars)
```
Powerful binaural beats for focus, sleep & relaxation. Science-backed frequencies.
```

### Full Description
See `play-store-description.txt` file.

---

## Design Templates

### Figma Template

If you have Figma, create a frame with:
- 1024 x 500 for feature graphic
- 1080 x 1920 for phone screenshots
- Use auto-layout for consistent spacing

### Canva Template (Free)

1. Go to canva.com
2. Search "Google Play Feature Graphic"
3. Search "App Screenshot mockup"
4. Customize with AuraTune colors

---

## Color Palette Reference

```css
/* AuraTune Brand Colors */
--primary: #8B5CF6;       /* Purple */
--accent: #10B981;        /* Emerald */
--warm: #F59E0B;          /* Amber */
--destructive: #EF4444;   /* Red */
--background: #0D0D0E;    /* Dark */
--foreground: #FFFFFF;    /* White text */
--muted: #27272A;         /* Dark gray */
--muted-foreground: #A1A1AA;
```

---

## File Naming Convention

```
feature-graphic.png
screenshot-01-home.png
screenshot-02-player.png
screenshot-03-stats.png
screenshot-04-timer.png
screenshot-05-profile.png
```

---

## Upload Checklist

Before uploading to Play Console:

- [ ] Feature graphic is 1024 x 500 px
- [ ] Screenshots are high resolution (1080p minimum)
- [ ] No blurry or stretched images
- [ ] Text is readable on all images
- [ ] Images show actual app content
- [ ] All files are under size limits
- [ ] Video is 30-60 seconds (if uploading)

---

## Resources

- [Google Play Store Graphics Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Device Mockup Generators](https://mockuphone.com/)
- [Free Phone Mockups](https://www.freepik.com/free-photos-vectors/phone-mockup)

---

Good luck with your designs! 🎨
