import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadow } from '../constants/theme';
import { getStats, getWeeklyChallengeCount, getLanguage } from '../services/storage';
import { Language } from '../types';

export default function StatsScreen() {
  const [stats, setStats] = useState({ total: 0, avg: 0, best: 0 });
  const [weekCount, setWeekCount] = useState(0);
  const [lang, setLang] = useState<Language>('es');

  useFocusEffect(
    useCallback(() => {
      getLanguage().then(setLang);
      getStats().then(setStats);
      getWeeklyChallengeCount().then(setWeekCount);
    }, []),
  );

  const cards: { icon: React.ComponentProps<typeof Ionicons>['name']; value: number; label: string }[] = [
    { icon: 'shirt-outline',    value: stats.total,  label: lang === 'es' ? 'Outfits'      : 'Outfits'      },
    { icon: 'star-outline',     value: stats.best,   label: lang === 'es' ? 'Mejor nota'   : 'Best score'   },
    { icon: 'analytics-outline',value: stats.avg,    label: lang === 'es' ? 'Media'        : 'Average'      },
    { icon: 'trophy-outline',   value: weekCount,    label: lang === 'es' ? 'Esta semana'  : 'This week'    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{lang === 'es' ? 'Estadísticas' : 'Statistics'}</Text>
        <Text style={styles.sub}>{lang === 'es' ? 'Tu progreso de estilo' : 'Your style progress'}</Text>
      </View>

      <View style={styles.grid}>
        {cards.map((card, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name={card.icon} size={24} color={colors.accentDark} />
            </View>
            <Text style={styles.value}>{card.value}</Text>
            <Text style={styles.label}>{card.label}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: { fontFamily: 'Inter_700Bold', fontSize: 34, color: colors.textPrimary },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(181,253,89,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontFamily: 'Inter_800ExtraBold', fontSize: 40, color: colors.textPrimary },
  label: { fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
});
