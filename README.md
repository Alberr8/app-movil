# Sportstyle

App móvil para puntuar y mejorar tus outfits deportivos. Analiza tu look según el deporte elegido y recibe recomendaciones de prendas y accesorios.

## Características

- Puntúa tu outfit deportivo (score del 5 al 10)
- 25 deportes disponibles: running, ciclismo, gimnasio, pádel, yoga, fútbol...
- Desglose de puntuación en 5 criterios: coordinación, ajuste, adecuación, tendencia y outfit completo
- Recomendaciones personalizadas de prendas por deporte
- Armario virtual para guardar tus outfits
- Reto semanal: consigue 3 outfits con nota ≥9 y desbloquea Premium
- Bilingüe: español e inglés
- Recordatorio diario a las 18:00

## Tecnologías

- [Expo](https://expo.dev) v56 + React Native 0.85
- React 19 + TypeScript 6
- React Navigation (stack + bottom tabs)
- AsyncStorage para persistencia local
- expo-image-picker, expo-notifications, expo-haptics

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
├── screens/      # CameraScreen, ScoreScreen, WardrobeScreen, ProfileScreen, PremiumScreen
├── components/   # ScoreRing, ChallengeBar, ShareSheet, OutfitCard
├── services/     # scoring.ts (local), storage.ts (AsyncStorage), notifications.ts
├── constants/    # theme.ts, i18n.ts (ES/EN)
└── types/        # index.ts
```
