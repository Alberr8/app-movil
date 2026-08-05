// ── Color palette ──────────────────────────────────────────────────────────────
export const palette = {
  // Carbon base (ink + dark surfaces)
  carbon: {
    950: '#0d0d10',
    900: '#16161a',
    800: '#1f1f24',
    700: '#26262e',
    600: '#3a3a42',
    500: '#56565f',
    400: '#82828c',
    300: '#9a9aa2',
    200: '#d3d3d8',
    100: '#e8e8ec',
    50:  '#f4f4f5',
  },
  // Lime — single electric accent
  lime: {
    50:  '#f7ffe3',
    100: '#ecffb8',
    200: '#ddff7d',
    300: '#d4ff3f',   // SIGNATURE electric accent — FAB, fills, score
    400: '#c2f000',   // accent deep — arcs/strokes on white
    500: '#a8d600',
    600: '#87ab00',
    700: '#657f00',
    800: '#46570a',   // accent ink — readable accent text on white
  },
};

// ── Semantic tokens ────────────────────────────────────────────────────────────
export const colors = {
  // Surfaces
  background:    '#f6f7f3',           // warm-neutral paper — main background
  card:          '#ffffff',           // pure white — cards
  paper2:        '#eceee6',           // alt surface fill

  // Dark surfaces (hero, camera)
  dark:          '#16161a',           // carbon-900 — ink / primary dark surface
  dark2:         '#26262e',           // carbon-700 — dark surface 2

  // Accent
  accent:        palette.lime[300],   // #d4ff3f — electric lime fills, FAB, AI moments
  accentBlue:    palette.lime[300],   // alias kept for compatibility
  accentDeep:    palette.lime[400],   // #c2f000 — arc/stroke accent on white
  accentDark:    palette.lime[600],   // #87ab00 — lime icon color on white
  accentInk:     palette.lime[800],   // #46570a — lime text on white bg

  // On-accent (text on lime fill)
  onAccent:      '#16161a',

  // Score colors
  scoreHigh:     palette.lime[400],
  scoreMid:      '#f5a524',
  scoreLow:      '#ff4d6d',

  // Text
  textPrimary:   '#16161a',           // carbon-900 / ink
  textSecondary: '#56565f',           // carbon-500 / ink2
  textTertiary:  '#9a9aa2',           // carbon-300 / ink3

  // Lines & separators
  separator:     '#e8e8ec',           // carbon-100 / line
  separator2:    '#f4f4f5',           // carbon-50  / line2

  // Semantic
  success:       palette.lime[300],
  successBg:     '#f1ffce',
  successInk:    palette.lime[800],
  warning:       '#f5a524',
  warningBg:     '#fff3df',
  danger:        '#ff4d6d',
  dangerBg:      '#ffe3e8',

  // Legacy aliases
  premium:       '#f5a524',
  overlay:       'rgba(13,13,16,0.52)',
};

// rgba helper using the lime-300 accent
export const accentAlpha = (opacity: number) =>
  `rgba(212,255,63,${opacity})`;

// ── Fonts ──────────────────────────────────────────────────────────────────────
// Serif (Cormorant Garamond) = editorial display + score number
// Sans  (DM Sans)            = all functional/UI text
export const fonts = {
  // DM Sans — UI / functional
  regular:    'DMSans_400Regular',
  medium:     'DMSans_500Medium',
  semiBold:   'DMSans_600SemiBold',
  bold:       'DMSans_700Bold',
  extraBold:  'DMSans_700Bold',         // DM Sans has no ExtraBold; use Bold
  // Cormorant Garamond — display / score
  serifRegular:  'CormorantGaramond_400Regular',
  serifMedium:   'CormorantGaramond_500Medium',
  serifSemiBold: 'CormorantGaramond_600SemiBold',
  serifBold:     'CormorantGaramond_700Bold',
  serifItalic:   'CormorantGaramond_500Medium_Italic',
};

// ── Spacing (4px base) ─────────────────────────────────────────────────────────
export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// ── Radii ──────────────────────────────────────────────────────────────────────
export const radius = {
  xs:   8,
  sm:   12,
  md:   16,
  lg:   20,
  xl:   28,
  xxl:  36,
  full: 9999,
};

// ── Typography scale ───────────────────────────────────────────────────────────
export const typography = {
  // Serif display (Cormorant Garamond)
  scoreNum:    { fontSize: 88, fontFamily: 'CormorantGaramond_600SemiBold', lineHeight: 80, letterSpacing: -2 },
  displayLg:   { fontSize: 48, fontFamily: 'CormorantGaramond_600SemiBold', lineHeight: 50, letterSpacing: -1 },
  displayMd:   { fontSize: 34, fontFamily: 'CormorantGaramond_600SemiBold', lineHeight: 37, letterSpacing: -0.5 },
  quote:       { fontSize: 22, fontFamily: 'CormorantGaramond_500Medium_Italic', lineHeight: 29 },

  // DM Sans — UI text
  largeTitle:  { fontSize: 28, fontFamily: 'DMSans_700Bold', letterSpacing: -0.56 },
  title1:      { fontSize: 22, fontFamily: 'DMSans_700Bold', letterSpacing: -0.33 },
  title2:      { fontSize: 18, fontFamily: 'DMSans_600SemiBold', letterSpacing: -0.18 },
  title3:      { fontSize: 16, fontFamily: 'DMSans_600SemiBold', letterSpacing: -0.08 },
  body:        { fontSize: 16, fontFamily: 'DMSans_400Regular', lineHeight: 24 },
  bodySm:      { fontSize: 14, fontFamily: 'DMSans_400Regular', lineHeight: 20 },
  label:       { fontSize: 14, fontFamily: 'DMSans_600SemiBold' },
  caption:     { fontSize: 13, fontFamily: 'DMSans_500Medium', color: '#9a9aa2' },
  overline:    { fontSize: 12, fontFamily: 'DMSans_600SemiBold', letterSpacing: 1.68, textTransform: 'uppercase' as const },
  button:      { fontSize: 16, fontFamily: 'DMSans_600SemiBold', letterSpacing: -0.16 },
  micro:       { fontSize: 11, fontFamily: 'DMSans_500Medium', letterSpacing: 0.11 },

  // Legacy aliases (screens that still use the old names)
  headline:    { fontSize: 17, fontFamily: 'DMSans_600SemiBold' },
  callout:     { fontSize: 16, fontFamily: 'DMSans_400Regular' },
  subhead:     { fontSize: 15, fontFamily: 'DMSans_400Regular' },
  footnote:    { fontSize: 13, fontFamily: 'DMSans_400Regular' },
};

// ── Shadows ────────────────────────────────────────────────────────────────────
export const shadow = {
  xs: {
    shadowColor: '#0d0d10',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0d0d10',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#0d0d10',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 5,
  },
  lg: {
    shadowColor: '#0d0d10',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 40,
    elevation: 10,
  },
  glow: {
    shadowColor: palette.lime[400],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.42,
    shadowRadius: 30,
    elevation: 12,
  },
};
