import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../constants/theme';
import { Outfit } from '../types';
import { SPORTS } from '../constants/i18n';

interface Props {
  outfit: Outfit;
  onPress?: () => void;
}

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 8 ? colors.scoreHigh : score >= 5 ? colors.scoreMid : colors.scoreLow;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.badgeText}>{score}</Text>
    </View>
  );
}

export default function OutfitCard({ outfit, onPress }: Props) {
  const sport = SPORTS.find(s => s.key === outfit.exerciseType);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
      <Image source={{ uri: outfit.imageUri }} style={styles.image} resizeMode="cover" />
      <ScoreBadge score={outfit.score.total} />
      <View style={styles.footer}>
        {sport && (
          <MaterialCommunityIcons
            name={sport.icon as any}
            size={16}
            color={colors.textSecondary}
          />
        )}
        <Text style={styles.date}>
          {new Date(outfit.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.card,
    ...shadow.md,
    marginBottom: 12,
  },
  image: { width: '100%', aspectRatio: 3 / 4 },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  date: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.textSecondary,
  },
});
