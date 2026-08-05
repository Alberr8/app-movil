# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Keep docs/index.md in sync (GitHub Pages)

`docs/index.md` is published live at https://alberr8.github.io/app-movil/ via GitHub Pages
(legacy Jekyll build, source `master:/docs`). **Whenever you make a code change to this app,
update `docs/index.md` to reflect the app's current state** (features, stack, "Estado actual" /
recent-fixes section) **and commit + push it together with the code change** — don't leave it to
a separate step or a later session. This is a standing instruction, not a one-off task.

## Important: Expo v56 Docs

**Always read the versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any Expo-related code.** APIs change between versions and the wrong version's docs will produce broken code.

## Key Versions

- Expo: 56.0.12
- React Native: 0.85.3
- React: 19.2.3
- TypeScript: 6.0.3 (strict mode enabled)

## Commands

```bash
# Web (localhost) — fastest iteration
npx expo start --web

# Physical device via QR (requires phone and PC on same network)
npx expo start

# Physical device when network/firewall is an issue
npx expo start --tunnel   # requires @expo/ngrok (already installed)

# Platform-specific
npx expo start --android
npx expo start --ios      # macOS only

# Type-check without building
npx tsc --noEmit

# Lint (ESLint via expo lint, flat config in eslint.config.js)
npm run lint
```

No test runner is configured. Linting is (`npm run lint` / `npx expo lint`) — keep it passing clean;
it already caught real bugs once (reading `.current` off a ref during render in ScoreRing.tsx /
ScoreScreen.tsx).

## EAS Build

`eas.json` defines three build profiles (see `npx eas-cli build --help`):

```bash
# One-time setup (creates the Expo account project, writes expo.extra.eas.projectId into app.json)
npx eas-cli login
npx eas-cli init

# Internal test build with dev client (Expo Go replacement, hot reload)
npx eas-cli build --profile development --platform android

# Installable APK/simulator build for internal testing (TestFlight/Play Internal Testing alternative)
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile preview --platform ios

# Store-ready build (auto-increments build number)
npx eas-cli build --profile production --platform all

# Upload a production build to App Store Connect / Play Console
npx eas-cli submit --profile production --platform ios
npx eas-cli submit --profile production --platform android
```

`app.json` sets `ios.bundleIdentifier` and `android.package` to `com.albertoriesgo.sportstyle` — this is effectively permanent once submitted to either store, do not change it casually.

## Navigation structure

Two-level navigation defined entirely in `App.tsx`, gated by auth/onboarding state:

```
RootStack (NativeStackNavigator)
├── Auth        → AuthScreen        (shown when there is no Supabase session)
├── Onboarding  → OnboardingScreen  (shown when session exists but onboarding isn't done)
└── Main        → TabNavigator (bottom tabs, custom tab bar with centered Camera FAB)
│   ├── Wardrobe → WardrobeScreen  (calendar view + saved outfits, filter by sport)
│   ├── Stats    → StatsScreen     (basic KPI grid: total/best/avg/this week)
│   ├── Camera   → CameraScreen    (home / outfit rating entry point)
│   ├── Premium  → PremiumScreen   (brand inspiration, locked behind weekly challenge)
│   └── Profile  → ProfileScreen   (name, stats, language, notifications, weekly AI summary)
    └── Score    → ScoreScreen     (result after rating; slides up from bottom, sibling of Main)
```

Types for both navigators live in `src/types/index.ts` (`RootStackParamList`, `TabParamList`).

`session` (Supabase) and `onboardingDone` (AsyncStorage flag) are both reactive state in `App.tsx`
and decide which branch of the root Stack is registered. `OnboardingScreen` receives
`onDone: () => void` as a prop and calls it instead of navigating directly — it must not call
`nav.replace('Main')` itself, since `'Main'` isn't a registered screen in the navigator until
`onboardingDone` flips to `true` and the parent re-renders. (This was a real bug: calling
`nav.replace('Main')` from inside Onboarding silently no-oped and left users stuck until they
force-reloaded the app.)

## Scoring: AI Edge Function, with a local fallback

`src/services/scoring.ts` → `scoreOutfit(imageUri, exerciseType, lang)`:
- **This is not offline.** It first calls `scoreOutfitWithAI()`, which base64-encodes the photo
  and invokes the Supabase Edge Function `score-outfit` (`supabase.functions.invoke`) — the image
  **is** sent to the backend for real analysis. Only if that call throws (network error, missing
  function, non-2xx response) does it fall back to `weightedRandom()` — a randomly weighted score
  (5–10) with a 2.2 s simulated delay, plus recommendations/products picked from static local data
  pools. Don't describe this feature as "the photo never leaves the device" — that was true of an
  earlier version but no longer is.
- `ExerciseType` maps to one of six `SportCategory` buckets (`endurance | strength | court | team | outdoor | mind_body`) which drive the fallback's recommendation content (and the AI path's product picks).
- In this dev environment the `score-outfit` Edge Function call fails with a CORS/400 error, so in
  practice every score you see locally comes from the local fallback — verify against the actual
  Supabase project's Edge Functions before assuming the AI path is exercised in a given environment.

## Storage

`src/services/storage.ts` wraps AsyncStorage. All persistence is local:
- Language preference, user name, notifications toggle
- Saved outfits (`Outfit[]`) keyed as a JSON blob
- Weekly challenge count + week key (resets each ISO week)
- Premium unlock flag (granted when weekly challenge is complete)

## i18n

`src/constants/i18n.ts` exports:
- `t(key, lang)` — typed helper for ES/EN UI strings
- `SPORTS: SportMeta[]` — master list of all 25 sports with keys, ES/EN labels, and `MaterialCommunityIcons` icon names
- `getSportLabel(key, lang)` — convenience lookup

`Language` is `'es' | 'en'`. Every screen reads the stored language on focus via `useFocusEffect`.

## Theme

`src/constants/theme.ts` is the single source of truth for all visual tokens:
- `colors.accentBlue` — primary accent colour (buttons, active states, highlighted text). Despite the name it can be any colour; change the hex value here to retheme the whole app.
- `colors.accent` — always black (`#000000`); used for the tab bar active tint and primary chip fill.
- `colors.scoreHigh / scoreMid / scoreLow` — green / orange / red for score display.
- `shadow.sm / md / lg` — pre-built shadow objects; apply with spread (`...shadow.md`).

## Auth & Supabase sync

`src/services/supabase.ts` exports a configured client (URL + anon key hardcoded, `AsyncStorage`
as the auth storage adapter). Used for:
- Auth (`AuthScreen.tsx`): email/password sign up and sign in.
- Preference sync (`OnboardingScreen.tsx`): on finishing onboarding, selected sports/brands are
  synced to the `sports`/`brands`/`user_sports`/`user_brands` tables — best-effort, wrapped in
  try/catch so a Supabase failure never blocks navigation (local AsyncStorage write happens first
  and always succeeds).
- Weekly AI coaching summary (`storage.ts` → `getWeeklyCoachingSummary`): invokes the
  `weekly-coaching` Supabase Edge Function with the week's outfits; requires network.

Saved outfits, stats, language, and notifications work fully offline. Scoring tries the network
first (see "Scoring: AI Edge Function, with a local fallback" above) and only degrades to local
when that fails.

## Cross-platform alerts

React Native's `Alert.alert` has no implementation on web — it silently no-ops instead of
throwing, so it's easy to ship a broken error message without noticing. Use
`showAlert(title, message)` from `src/utils/alert.ts` instead of importing `Alert` directly; it
falls back to `window.alert` on web. `CameraScreen.tsx` still has one raw `Alert.alert` call, but
it's behind an `if (Platform.OS !== 'web')` guard so it's unreachable there — leave it as is unless
that guard changes.

## Camera tab pointer-events (web)

On web, `CameraScreen`'s entire subtree used to inherit `pointer-events: none` from the bottom-tabs
screen container — a react-navigation/RN-Web interaction that, as far as we've observed, only
affects this tab (Wardrobe/Stats/Premium/Profile were unaffected). The symptom: every control on
the screen (shutter, gallery picker, sport selector) rendered fine but did nothing on click, with
no console error. Fixed by explicitly setting `pointerEvents: 'auto'` in `styles.root` in
`CameraScreen.tsx`. If a similar "renders fine, nothing responds to clicks" symptom shows up on
another screen, check computed `pointer-events` up the ancestor chain in devtools before assuming
the bug is in the screen's own event handlers.

## Architecture notes

- `App.tsx` also handles font loading (Inter family via `@expo-google-fonts/inter`) and blocks render until fonts are ready using `SplashScreen.preventAutoHideAsync()`.
- Notifications (`src/services/notifications.ts`) are skipped entirely on web (`Platform.OS === 'web'` guard).
- TypeScript path aliases are not configured; use relative imports throughout.
- `app.json` locks orientation to portrait and sets Android adaptive icon assets from `assets/`.
