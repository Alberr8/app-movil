import { ExerciseType, Language } from '../types';

// ─── Sport metadata ──────────────────────────────────────────────────────────
export interface SportMeta {
  key: ExerciseType;
  labelEs: string;
  labelEn: string;
  icon: string; // MaterialCommunityIcons name
}

export const SPORTS: SportMeta[] = [
  { key: 'running',      labelEs: 'Running',        labelEn: 'Running',       icon: 'run' },
  { key: 'cycling',      labelEs: 'Ciclismo',       labelEn: 'Cycling',       icon: 'bike' },
  { key: 'swimming',     labelEs: 'Natación',       labelEn: 'Swimming',      icon: 'swim' },
  { key: 'gym',          labelEs: 'Gimnasio',       labelEn: 'Gym',           icon: 'weight-lifter' },
  { key: 'yoga',         labelEs: 'Yoga',           labelEn: 'Yoga',          icon: 'yoga' },
  { key: 'padel',        labelEs: 'Pádel',          labelEn: 'Padel',         icon: 'tennis' },
  { key: 'tennis',       labelEs: 'Tenis',          labelEn: 'Tennis',        icon: 'tennis-ball' },
  { key: 'football',     labelEs: 'Fútbol',         labelEn: 'Football',      icon: 'soccer' },
  { key: 'basketball',   labelEs: 'Baloncesto',     labelEn: 'Basketball',    icon: 'basketball' },
  { key: 'hiking',       labelEs: 'Senderismo',     labelEn: 'Hiking',        icon: 'hiking' },
  { key: 'crossfit',     labelEs: 'CrossFit',       labelEn: 'CrossFit',      icon: 'dumbbell' },
  { key: 'triathlon',    labelEs: 'Triatlón',       labelEn: 'Triathlon',     icon: 'triforce' },
  { key: 'boxing',       labelEs: 'Boxeo',          labelEn: 'Boxing',        icon: 'boxing-glove' },
  { key: 'martial_arts', labelEs: 'Artes Marciales',labelEn: 'Martial Arts',  icon: 'karate' },
  { key: 'dance',        labelEs: 'Danza',          labelEn: 'Dance',         icon: 'dance-ballroom' },
  { key: 'pilates',      labelEs: 'Pilates',        labelEn: 'Pilates',       icon: 'human-handsup' },
  { key: 'rugby',        labelEs: 'Rugby',          labelEn: 'Rugby',         icon: 'rugby' },
  { key: 'volleyball',   labelEs: 'Voleibol',       labelEn: 'Volleyball',    icon: 'volleyball' },
  { key: 'surf',         labelEs: 'Surf',           labelEn: 'Surf',          icon: 'surfing' },
  { key: 'skiing',       labelEs: 'Esquí',          labelEn: 'Skiing',        icon: 'ski' },
  { key: 'climbing',     labelEs: 'Escalada',       labelEn: 'Climbing',      icon: 'image-filter-hdr' },
  { key: 'golf',         labelEs: 'Golf',           labelEn: 'Golf',          icon: 'golf' },
  { key: 'horse_riding', labelEs: 'Equitación',     labelEn: 'Horse Riding',  icon: 'horse' },
  { key: 'skateboard',   labelEs: 'Skateboard',     labelEn: 'Skateboard',    icon: 'skateboard' },
  { key: 'baseball',     labelEs: 'Béisbol',        labelEn: 'Baseball',      icon: 'baseball' },
];

export function getSportLabel(key: ExerciseType, lang: Language): string {
  const sport = SPORTS.find(s => s.key === key);
  if (!sport) return key;
  return lang === 'es' ? sport.labelEs : sport.labelEn;
}

// ─── UI strings ──────────────────────────────────────────────────────────────
const strings = {
  es: {
    tabHome: 'Inicio',
    tabPremium: 'Premium',
    tabWardrobe: 'Armario',
    tabProfile: 'Perfil',

    cameraTitle: 'Tu Outfit',
    cameraSubtitle: 'Captura o sube una foto de tu outfit deportivo',
    cameraPickPhoto: 'Galería',
    cameraTakePhoto: 'Cámara',
    cameraExerciseLabel: 'Deporte',
    cameraSubmit: 'Puntuar outfit',
    cameraScoring: 'Analizando...',
    challengeTitle: 'Reto semanal',
    challengeProgress: (n: number) => `${n}/3 outfits con nota ≥9`,
    challengeUnlocked: 'Premium desbloqueado esta semana',

    scoreBasis: 'Basado en Runner\'s World, GQ Sport, Lululemon Blog, Men\'s Health Sport y Nike Training Club',
    scoreCoordination: 'Coordinación',
    scoreFit: 'Ajuste',
    scoreAppropriateness: 'Adecuación',
    scoreTrend: 'Tendencia',
    scoreCompleteness: 'Outfit completo',
    scoreRecommendations: 'Cómo mejorar',
    scoreProducts: 'Prendas recomendadas',
    scoreSave: 'Guardar en armario',
    scoreShare: 'Compartir',
    scoreSaved: 'Guardado en tu armario',
    scoreProductReplace: 'Sustituir',
    scoreProductAdd: 'Añadir',
    shareWhatsApp: 'WhatsApp',
    shareInstagram: 'Instagram',
    shareStrava: 'Strava',
    scoreChallengeProgress: (n: number) => `${n}/3 en el reto semanal`,
    scoreChallengeComplete: 'Semana Premium desbloqueada',

    wardrobeTitle: 'Armario',
    wardrobeEmpty: 'Sin outfits todavía',
    wardrobeEmptySub: 'Sube tu primer outfit y empieza a mejorar tu estilo deportivo',
    wardrobeUpload: 'Subir primer outfit',
    wardrobeAll: 'Todos',
    wardrobeTraining: 'Entreno',
    wardrobeRace: 'Carrera',
    wardrobeOutfits: (n: number) => `${n} outfit${n !== 1 ? 's' : ''}`,

    premiumTitle: 'Premium',
    premiumLocked: 'Contenido Premium',
    premiumLockedSub: 'Consigue 3 outfits con nota ≥9 esta semana para desbloquear gratis',
    premiumUnlock: 'Desbloquear Premium',
    premiumUnlocked: 'Semana gratis desbloqueada',
    premiumWeeklyBest: 'Mejores outfits de la semana',
    premiumInspiration: 'Inspiración',
    premiumBrands: 'Mejores marcas',

    profileTitle: 'Perfil',
    profileNamePlaceholder: 'Tu nombre',
    profileStats: 'Estadísticas',
    profileTotalOutfits: 'Outfits',
    profileAvgScore: 'Media',
    profileBestScore: 'Mejor nota',
    profileLanguage: 'Idioma',
    profileLanguageEs: 'Español',
    profileLanguageEn: 'English',
    profileNotifications: 'Recordatorio diario 18:00',
    profileChallenge: 'Reto semanal',
    profileWeeklyCoaching: 'Resumen semanal AI',
    profileWeeklyCoachingBtn: 'Analizar mi semana',
    profileWeeklyCoachingRefresh: 'Regenerar',
    profileWeeklyCoachingLoading: 'Analizando tu semana...',
    scoreCoachingNudge: 'Tu coach dice',
  },
  en: {
    tabHome: 'Home',
    tabPremium: 'Premium',
    tabWardrobe: 'Wardrobe',
    tabProfile: 'Profile',

    cameraTitle: 'Your Outfit',
    cameraSubtitle: 'Capture or upload a photo of your sports outfit',
    cameraPickPhoto: 'Gallery',
    cameraTakePhoto: 'Camera',
    cameraExerciseLabel: 'Sport',
    cameraSubmit: 'Rate outfit',
    cameraScoring: 'Analyzing...',
    challengeTitle: 'Weekly challenge',
    challengeProgress: (n: number) => `${n}/3 outfits scoring ≥9`,
    challengeUnlocked: 'Premium unlocked this week',

    scoreBasis: 'Rated based on Runner\'s World, GQ Sport, Lululemon Blog, Men\'s Health Sport and Nike Training Club',
    scoreCoordination: 'Coordination',
    scoreFit: 'Fit',
    scoreAppropriateness: 'Appropriateness',
    scoreTrend: 'Trend',
    scoreCompleteness: 'Complete outfit',
    scoreRecommendations: 'How to improve',
    scoreProducts: 'Recommended products',
    scoreSave: 'Save to wardrobe',
    scoreShare: 'Share',
    scoreSaved: 'Saved to your wardrobe',
    scoreProductReplace: 'Replace',
    scoreProductAdd: 'Add',
    shareWhatsApp: 'WhatsApp',
    shareInstagram: 'Instagram',
    shareStrava: 'Strava',
    scoreChallengeProgress: (n: number) => `${n}/3 in the weekly challenge`,
    scoreChallengeComplete: 'Free Premium week unlocked',

    wardrobeTitle: 'Wardrobe',
    wardrobeEmpty: 'No outfits yet',
    wardrobeEmptySub: 'Upload your first outfit and start improving your sports style',
    wardrobeUpload: 'Upload first outfit',
    wardrobeAll: 'All',
    wardrobeTraining: 'Training',
    wardrobeRace: 'Race',
    wardrobeOutfits: (n: number) => `${n} outfit${n !== 1 ? 's' : ''}`,

    premiumTitle: 'Premium',
    premiumLocked: 'Premium Content',
    premiumLockedSub: 'Get 3 outfits with score ≥9 this week to unlock for free',
    premiumUnlock: 'Unlock Premium',
    premiumUnlocked: 'Free week unlocked',
    premiumWeeklyBest: 'Best outfits of the week',
    premiumInspiration: 'Inspiration',
    premiumBrands: 'Best brands',

    profileTitle: 'Profile',
    profileNamePlaceholder: 'Your name',
    profileStats: 'Stats',
    profileTotalOutfits: 'Outfits',
    profileAvgScore: 'Average',
    profileBestScore: 'Best score',
    profileLanguage: 'Language',
    profileLanguageEs: 'Español',
    profileLanguageEn: 'English',
    profileNotifications: 'Daily reminder 6 PM',
    profileChallenge: 'Weekly challenge',
    profileWeeklyCoaching: 'Weekly AI Summary',
    profileWeeklyCoachingBtn: 'Analyze my week',
    profileWeeklyCoachingRefresh: 'Refresh',
    profileWeeklyCoachingLoading: 'Analyzing your week...',
    scoreCoachingNudge: 'Your coach says',
  },
} as const;

type StringsEs = typeof strings.es;
type StringsEn = typeof strings.en;
type Strings = StringsEs & StringsEn;

export function t<K extends keyof Strings>(key: K, lang: Language): Strings[K] {
  const dict = strings[lang] as Strings;
  return dict[key];
}
