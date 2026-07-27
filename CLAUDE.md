# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
```

No test runner or linter is configured.

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

Two-level navigation defined entirely in `App.tsx`:

```
RootStack (NativeStackNavigator)
├── Main → TabNavigator (bottom tabs)
│   ├── Camera   → CameraScreen   (tab: home / outfit rating entry point)
│   ├── Premium  → PremiumScreen  (brand inspiration, locked behind weekly challenge)
│   ├── Wardrobe → WardrobeScreen (saved outfits history)
│   └── Profile  → ProfileScreen  (name, stats, language, notifications toggle)
└── Score → ScoreScreen           (result after rating; slides up from bottom)
```

Types for both navigators live in `src/types/index.ts` (`RootStackParamList`, `TabParamList`).

## Scoring is 100% local / offline

`src/services/scoring.ts` → `scoreOutfit(imageUri, exerciseType, lang)`:
- The image is **never sent anywhere**. The URI is accepted but ignored.
- Returns a randomly weighted score (5–10) with a 2.2 s simulated delay.
- Picks sport-category-specific text recommendations and product links from static data pools inside the file.
- `ExerciseType` maps to one of six `SportCategory` buckets (`endurance | strength | court | team | outdoor | mind_body`) which drive all recommendation content.

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

## Architecture notes

- `App.tsx` also handles font loading (Inter family via `@expo-google-fonts/inter`) and blocks render until fonts are ready using `SplashScreen.preventAutoHideAsync()`.
- Notifications (`src/services/notifications.ts`) are skipped entirely on web (`Platform.OS === 'web'` guard).
- TypeScript path aliases are not configured; use relative imports throughout.
- `app.json` locks orientation to portrait and sets Android adaptive icon assets from `assets/`.
