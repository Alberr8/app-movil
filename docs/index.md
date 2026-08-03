---
title: Sportstyle
---

# Sportstyle

App móvil para puntuar y mejorar tus outfits deportivos. Analiza tu look según el deporte elegido y recibe recomendaciones de prendas y accesorios.

[Ver el código en GitHub](https://github.com/Alberr8/app-movil)

## Características

- Cuenta de usuario (registro/login con Supabase Auth) y onboarding inicial: tagline, selección de deportes favoritos y marcas favoritas
- Puntúa tu outfit deportivo (score del 5 al 10) — intenta análisis por IA vía Supabase Edge Function y, si falla, cae a una puntuación local simulada
- 25 deportes disponibles: running, ciclismo, gimnasio, pádel, yoga, fútbol...
- Desglose de puntuación en 5 criterios: coordinación, ajuste, adecuación, tendencia y outfit completo
- Recomendaciones personalizadas de prendas por deporte
- Armario virtual con vista de calendario y filtro por deporte
- Estadísticas básicas: outfits totales, mejor nota, media, retos de la semana
- Reto semanal: consigue 3 outfits con nota ≥9 y desbloquea Premium
- Resumen semanal con IA vía Supabase Edge Function
- Bilingüe: español e inglés
- Recordatorio diario a las 18:00

## Stack técnico

- [Expo](https://expo.dev) v56 + React Native 0.85
- React 19 + TypeScript 6 (strict)
- React Navigation (stack + bottom tabs, 5 tabs)
- Supabase — Auth, Postgres y Edge Functions
- AsyncStorage para persistencia y cache local

## Desarrollo

```bash
npm install
npx expo start --web
```

Ver el [README](https://github.com/Alberr8/app-movil#readme) del repositorio para el resto de comandos (dispositivo físico, verificación de tipos, etc.) y detalles de arquitectura.
