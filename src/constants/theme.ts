// ── Color palette ──────────────────────────────────────────────────────────────
export const palette = {
  lime: {
    50:  '#f5ffe5',
    100: '#e9ffc7',
    200: '#d3ff96',
    300: '#b5fd59',
    400: '#98f427',
    500: '#78db07',
    600: '#65c301',
    700: '#458506',
    800: '#39680c',
    900: '#31580f',
    950: '#173102',
  },
};

// ── Semantic tokens ────────────────────────────────────────────────────────────
export const colors = {
  background:    '#F2F2F2',           // light gray background (iOS system)
  card:          '#FFFFFF',           // white cards
  accent:        palette.lime[300],   // lime 300 — CTA fill, chip active bg
  accentBlue:    palette.lime[300],   // alias kept for compatibility
  accentDark:    palette.lime[600],   // lime 600 — lime text/icons on white bg
  accentOrange:  '#FF6B35',
  scoreHigh:     palette.lime[600],   // lime 600 — readable on both light & dark
  scoreMid:      '#FF9A00',
  scoreLow:      '#FF3B30',
  textPrimary:   '#0D0D0D',
  textSecondary: 'rgba(0,0,0,0.45)',
  textTertiary:  'rgba(0,0,0,0.28)',
  separator:     'rgba(0,0,0,0.07)',
  premium:       '#F59E0B',
  overlay:       'rgba(0,0,0,0.52)',
};

// rgba helper using the lime 300 accent
export const accentAlpha = (opacity: number) =>
  `rgba(181,253,89,${opacity})`;

export const fonts = {
  regular:   'Inter_400Regular',
  medium:    'Inter_500Medium',
  semiBold:  'Inter_600SemiBold',
  bold:      'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
};

export const typography = {
  largeTitle: { fontSize: 34, fontFamily: 'Inter_700Bold',    letterSpacing: 0.4 },
  title1:     { fontSize: 28, fontFamily: 'Inter_700Bold' },
  title2:     { fontSize: 22, fontFamily: 'Inter_700Bold' },
  title3:     { fontSize: 20, fontFamily: 'Inter_600SemiBold' },
  headline:   { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  body:       { fontSize: 17, fontFamily: 'Inter_400Regular' },
  callout:    { fontSize: 16, fontFamily: 'Inter_400Regular' },
  subhead:    { fontSize: 15, fontFamily: 'Inter_400Regular' },
  footnote:   { fontSize: 13, fontFamily: 'Inter_400Regular' },
  caption:    { fontSize: 12, fontFamily: 'Inter_400Regular' },
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 10,
  },
  glow: {
    shadowColor: palette.lime[300],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.50,
    shadowRadius: 20,
    elevation: 12,
  },
};
