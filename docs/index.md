---
title: Sportstyle
---

# Sportstyle

App móvil para puntuar y mejorar tus outfits deportivos. Analiza tu look según el deporte elegido y recibe recomendaciones de prendas y accesorios.

[Ver el código en GitHub](https://github.com/Alberr8/app-movil) · [Política de Privacidad](privacy-policy.html) · [Términos de Servicio](terms.html)

## Estado actual

Verificado end-to-end en navegador (registro → onboarding → cámara → puntuación → armario).
Arreglos recientes:

- El onboarding ya no se queda congelado al pulsar "Empezar" (bug de navegación en `App.tsx`/`OnboardingScreen.tsx`).
- Los errores de login/registro ahora se muestran también en web (antes `Alert.alert` no hacía nada ahí).
- La tab de Cámara ya responde a los toques en web (heredaba `pointer-events: none` del navigator de tabs).
- Los outfits guardados ya no desaparecen del Armario/Stats a los pocos segundos: `getOutfits()`
  sobrescribía el caché local con lo que devolviera Supabase, así que si la sincronización fallaba
  (como pasaba siempre, por un `worn_date` que faltaba en la tabla) el outfit recién guardado se
  borraba solo. Ahora se fusiona en vez de sobrescribir.
- ✅ Migración `worn_date` aplicada en el Supabase real — verificado consultando la tabla `outfits` directamente: los outfits guardados ya sincronizan de verdad con el backend, no solo en local.
- Los nombres de la barra de tabs inferior ahora cambian al instante al cambiar idioma en Perfil — antes se quedaban congelados porque la barra solo leía el idioma una vez, al arrancar la app.
- ⚠️ **Pendiente, a propósito**: el scoring por IA real (`score-outfit`, `weekly-coaching`) necesita el secreto `ANTHROPIC_API_KEY` en Supabase — hasta que se dé de alta esa API, la app sigue funcionando bien con el fallback de puntuación local aleatoria.
- ✅ Se añadió ESLint (`npm run lint`) — encontró 18 problemas reales en la primera pasada, incluidos 6 errores por leer `.current` de un ref durante el render (`ScoreRing.tsx`, `ScoreScreen.tsx`). Todo corregido, el linter pasa limpio.
- 🧹 Limpieza de duplicación de código: el formato de fecha local `YYYY-MM-DD` estaba triplicado (dos copias idénticas en `WardrobeScreen.tsx` y una tercera en `ScoreScreen.tsx`) — ahora vive en `src/utils/date.ts` (`toLocalISODate`). El umbral score→color (verde/ámbar/rojo) estaba triplicado en `ScoreRing.tsx`, `OutfitCard.tsx` y `ScoreScreen.tsx` — ahora `ScoreRing.tsx` exporta `getScoreColor()` y los otros dos lo importan. Sin cambios de comportamiento.
- ✅ Primer test runner del proyecto: `jest-expo` + `npm test`, 15 tests cubriendo lógica pura (semana ISO en `storage.ts`, reparto de puntuación en `scoring.ts`, paridad de claves ES/EN en `i18n.ts`). Todavía no hay tests de pantallas/componentes.

## Camino a las tiendas (App Store / Play Store)

- ✅ Bundle identifiers (`com.albertoriesgo.sportstyle`) y `eas.json` con perfiles de build.
- ✅ Política de privacidad y términos de servicio.
- ✅ Textos de permisos de cámara/galería configurados (`expo-camera`, `expo-image-picker`) — antes faltaban y Apple habría rechazado la app directamente.
- ⬜ Generar el primer build real (`eas login` + `eas build`) — necesita tu cuenta de Expo, no se puede hacer sin tus credenciales.
- ⬜ Metadata de tienda: capturas, descripción, clasificación de edad.

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
