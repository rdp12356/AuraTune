

## Plan: App Store Deployment + Lovable Payments

### Part 1: Publishing to App Store & Google Play (Capacitor)

Your app needs **Capacitor** to wrap the web app into native iOS and Android builds.

**Steps you'll do in Lovable:**
1. Install Capacitor dependencies (`@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`)
2. Initialize Capacitor with your project config
3. Configure `capacitor.config.ts` with your app ID and hot-reload URL

**Steps you'll do on your computer:**
1. Export the project to GitHub and clone it
2. Run `npm install`, then `npx cap add ios` and `npx cap add android`
3. Run `npm run build && npx cap sync`
4. Open in Xcode (`npx cap run ios`) or Android Studio (`npx cap run android`)
5. Submit to App Store / Google Play through those tools

You'll need a **$99/year Apple Developer account** and a **$25 one-time Google Play Developer account**.

### Part 2: One-Time Purchase via Lovable Payments

To add a payment wall (e.g. unlock all presets or premium features):

1. **Enable Lovable Cloud** — needed for backend (database, auth, edge functions)
2. **Enable Lovable Payments** — set up a one-time purchase product (e.g. "Frequency Flow Pro — $4.99")
3. **Create a premium gate** — lock certain presets or features behind a purchase check
4. **Add a purchase/unlock screen** — show pricing and trigger checkout
5. **Add a success page** — confirm the purchase and unlock features

### Files to create/modify:
- `capacitor.config.ts` — new, Capacitor configuration
- `src/pages/PricingScreen.tsx` — new, purchase screen
- `src/pages/PaymentSuccess.tsx` — new, post-purchase confirmation
- `src/App.tsx` — add new routes
- `src/lib/presets.ts` — mark some presets as premium
- Edge function for checkout verification

### Implementation order:
1. Set up Capacitor for native deployment
2. Enable Lovable Cloud + Payments
3. Add premium preset gating and purchase flow

