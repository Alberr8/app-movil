import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, shadow } from '../constants/theme';
import { Language } from '../types';
import { t } from '../constants/i18n';

interface Props {
  count: number;
  lang: Language;
  unlocked?: boolean;
}

export default function ChallengeBar({ count, lang, unlocked }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{t('challengeTitle', lang)}</Text>
        <Text style={styles.subtitle}>
          {unlocked
            ? t('challengeUnlocked', lang)
            : (t('challengeProgress', lang) as (n: number) => string)(Math.min(count, 3))}
        </Text>
      </View>
      <View style={styles.pips}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.pip, i < count && styles.pipActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  left: { flex: 1 },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  pips: { flexDirection: 'row', gap: 6, marginLeft: spacing.md },
  pip: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.separator,
  },
  pipActive: { backgroundColor: colors.premium },
});
