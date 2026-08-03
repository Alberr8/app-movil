# Sportstyle

App móvil para puntuar y mejorar tus outfits deportivos. Analiza tu look según el deporte elegido y recibe recomendaciones de prendas y accesorios.

## Características

- Cuenta de usuario (registro/login con Supabase Auth) y onboarding inicial: tagline, selección de deportes favoritos y marcas favoritas
- Puntúa tu outfit deportivo (score del 5 al 10) — intenta análisis por IA vía Supabase Edge Function y, si falla, cae a una puntuación local simulada
- 25 deportes disponibles: running, ciclismo, gimnasio, pádel, yoga, fútbol...
- Desglose de puntuación en 5 criterios: coordinación, ajuste, adecuación, tendencia y outfit completo
- Recomendaciones personalizadas de prendas por deporte
- Armario virtual con vista de calendario y filtro por deporte
- Estadísticas básicas: outfits totales, mejor nota, media, retos de la semana
- Reto semanal: consigue 3 outfits con nota ≥9 y desbloquea Premium
- Resumen semanal con IA vía Supabase Edge Function (`weekly-coaching`)
- Bilingüe: español e inglés
- Recordatorio diario a las 18:00

## Tecnologías

- [Expo](https://expo.dev) v56 + React Native 0.85
- React 19 + TypeScript 6 (strict)
- React Navigation (stack + bottom tabs, 5 tabs)
- Supabase — Auth, Postgres (preferencias de sports/brands) y Edge Functions
- AsyncStorage para persistencia y cache local
- expo-camera, expo-image-picker, expo-notifications, expo-haptics, expo-linear-gradient, expo-blur
- @expo-google-fonts/inter

## Desarrollo

```bash
# Instalar dependencias
npm install

# Web (localhost)
npx expo start --web

# Dispositivo físico (misma red WiFi)
npx expo start

# Dispositivo físico (si hay problemas de red)
npx expo start --tunnel

# Verificar tipos
npx tsc --noEmit
```

Escanea el QR con la app [Expo Go](https://expo.dev/go) en tu móvil.

## Estructura

```
src/
├── screens/      # AuthScreen, OnboardingScreen, CameraScreen, ScoreScreen,
│                 # WardrobeScreen, StatsScreen, PremiumScreen, ProfileScreen
├── components/   # ScoreRing, ChallengeBar, ShareSheet, OutfitCard
├── services/     # scoring.ts (local), storage.ts (AsyncStorage + Supabase sync),
│                 # supabase.ts (cliente), notifications.ts
├── utils/        # alert.ts — showAlert() cross-platform (Alert.alert no funciona en web)
├── constants/    # theme.ts, i18n.ts (ES/EN)
└── types/        # index.ts
```

## Navegación

```
Auth (si no hay sesión)
  └─ Onboarding (si no se completó)
       └─ Tabs: Armario · Stats · Cámara · Premium · Perfil
            └─ Score (modal, tras puntuar un outfit)
```

`onboardingDone` vive como estado reactivo en `App.tsx` — `OnboardingScreen` lo notifica vía un
callback `onDone()` en vez de navegar directamente, para que el `Stack.Navigator` raíz re-renderice
con la pantalla `Main` ya registrada.

## Notas técnicas

- El scoring intenta primero una función de IA en Supabase (`score-outfit`, recibe la foto en
  base64) y solo si falla cae a una puntuación aleatoria local — no es "100% offline" pese a lo que
  decía una versión anterior de este documento. Ver `src/services/scoring.ts`.
- El resumen semanal con IA y la sincronización de preferencias (deportes/marcas) también requieren
  Supabase y conexión a internet; el resto de la app (outfits guardados, stats, idioma,
  notificaciones) funciona offline.
- `StatsScreen` es la más reciente y aún básica: 4 KPIs sin gráfico de tendencia.
- No hay test runner ni linter configurado todavía.
