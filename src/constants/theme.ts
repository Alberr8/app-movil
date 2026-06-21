export const colors = {
  background: '#F2F2F7',
  card: '#FFFFFF',
  accent: '#000000',
  accentBlue: '#39FF14',
  accentOrange: '#FF6B35',
  scoreHigh: '#34C759',
  scoreMid: '#FF9500',
  scoreLow: '#FF3B30',
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  separator: '#E5E5EA',
  premium: '#FFD700',
  overlay: 'rgba(0,0,0,0.5)',
};

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  largeTitle: { fontSize: 34, fontFamily: 'Inter_700Bold', letterSpacing: 0.4 },
  title1: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  title2: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  title3: { fontSize: 20, fontFamily: 'Inter_600SemiBold' },
  headline: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  body: { fontSize: 17, fontFamily: 'Inter_400Regular' },
  callout: { fontSize: 16, fontFamily: 'Inter_400Regular' },
  subhead: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  footnote: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  caption: { fontSize: 12, fontFamily: 'Inter_400Regular' },
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
};
