import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Linking, Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadow } from '../constants/theme';
import { t } from '../constants/i18n';
import { Language } from '../types';
import { getLanguage, isPremiumUnlocked, getWeeklyChallengeCount } from '../services/storage';
import ChallengeBar from '../components/ChallengeBar';

interface Card {
  id: string;
  title: string;
  subtitleEs: string;
  subtitleEn: string;
  color: string;
  url?: string;
}

const weeklyBests: Card[] = [
  { id: '1', title: 'Training Look #1', subtitleEs: 'Nike Dri-FIT + HOKA Clifton 9', subtitleEn: 'Nike Dri-FIT + HOKA Clifton 9', color: '#1a1a2e' },
  { id: '2', title: 'Race Day', subtitleEs: 'Adidas Adizero + Salomon Vest', subtitleEn: 'Adidas Adizero + Salomon Vest', color: '#16213e' },
  { id: '3', title: 'Gym Essentials', subtitleEs: 'Gymshark + New Balance 574', subtitleEn: 'Gymshark + New Balance 574', color: '#0f3460' },
];

const inspirations: Card[] = [
  { id: '4', title: 'Colorblock Running', subtitleEs: 'Tendencia de la temporada', subtitleEn: 'Trend of the season', color: '#1b1b2f' },
  { id: '5', title: 'Monochrome Training', subtitleEs: 'Minimalismo deportivo', subtitleEn: 'Sports minimalism', color: '#2c2c54' },
  { id: '6', title: 'Tech-wear Outdoor', subtitleEs: 'Lo mejor para trail', subtitleEn: 'Best for trail', color: '#1b262c' },
];

const brands: Card[] = [
  { id: '7', title: 'Nike', subtitleEs: 'Dri-FIT ADV Collection', subtitleEn: 'Dri-FIT ADV Collection', color: '#111', url: 'https://www.nike.com' },
  { id: '8', title: 'Lululemon', subtitleEs: 'Swiftly Tech & ABC Pants', subtitleEn: 'Swiftly Tech & ABC Pants', color: '#1a1a1a', url: 'https://www.lululemon.com' },
  { id: '9', title: 'On Running', subtitleEs: 'Cloudmonster & Apparel', subtitleEn: 'Cloudmonster & Apparel', color: '#2e4057', url: 'https://www.on.com' },
  { id: '10', title: 'Gymshark', subtitleEs: 'Vital Seamless Range', subtitleEn: 'Vital Seamless Range', color: '#00766c', url: 'https://www.gymshark.com' },
];

function ContentCard({ card, locked, lang }: { card: Card; locked: boolean; lang: Language }) {
  const subtitle = lang === 'es' ? card.subtitleEs : card.subtitleEn;
  return (
    <TouchableOpacity
      onPress={() => card.url && !locked && Linking.openURL(card.url).catch(() => {})}
      activeOpacity={locked ? 1 : 0.82}
      style={[styles.card, { backgroundColor: card.color }]}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardSub}>{subtitle}</Text>
      </View>
      {card.url && !locked && (
        <Ionicons name="arrow-forward-circle-outline" size={22} color="rgba(255,255,255,0.6)" />
      )}
      {locked && (
        Platform.OS === 'web' ? (
          <View style={[StyleSheet.absoluteFill, styles.webBlur]}>
            <Ionicons name="lock-closed" size={22} color="rgba(255,255,255,0.6)" />
          </View>
        ) : (
          <BlurView intensity={28} style={StyleSheet.absoluteFill} tint="dark">
            <View style={styles.blurInner}>
              <Ionicons name="lock-closed" size={22} color="rgba(255,255,255,0.6)" />
            </View>
          </BlurView>
        )
      )}
    </TouchableOpacity>
  );
}

export default function PremiumScreen() {
  const [lang, setLang] = useState<Language>('es');
  const [unlocked, setUnlocked] = useState(false);
  const [challengeCount, setChallengeCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      Promise.all([getLanguage(), isPremiumUnlocked(), getWeeklyChallengeCount()]).then(
        ([l, pu, cc]) => { setLang(l as Language); setUnlocked(pu); setChallengeCount(cc); },
      );
    }, []),
  );

  const sections = [
    { title: t('premiumWeeklyBest', lang) as string, cards: weeklyBests },
    { title: t('premiumInspiration', lang) as string, cards: inspirations },
    { title: t('premiumBrands', lang) as string, cards: brands },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('premiumTitle', lang)}</Text>

        {unlocked ? (
          <View style={styles.unlockedBanner}>
            <Text style={styles.unlockedText}>{t('premiumUnlocked', lang)}</Text>
          </View>
        ) : (
          <ChallengeBar count={challengeCount} lang={lang} unlocked={false} />
        )}

        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.cards.map((card, idx) => (
              <View key={card.id} style={styles.cardWrapper}>
                <ContentCard card={card} locked={!unlocked && idx > 0} lang={lang} />
              </View>
            ))}
          </View>
        ))}

        {!unlocked && (
          <View style={styles.ctaBox}>
            <Text style={styles.ctaTitle}>{t('premiumLocked', lang)}</Text>
            <Text style={styles.ctaSub}>{t('premiumLockedSub', lang)}</Text>
            <LinearGradient colors={[colors.premium, '#FFA500']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
              <Text style={styles.ctaBtnText}>{t('premiumUnlock', lang)}</Text>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { fontFamily: 'Inter_700Bold', fontSize: 34, color: colors.textPrimary, marginBottom: spacing.md },
  unlockedBanner: {
    backgroundColor: colors.premium,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  unlockedText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#000' },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: colors.textPrimary, marginBottom: spacing.sm },
  cardWrapper: { marginBottom: spacing.sm, borderRadius: radius.lg, overflow: 'hidden' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: radius.lg,
    ...shadow.sm,
    minHeight: 64,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FFFFFF' },
  cardSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  webBlur: {
    backgroundColor: 'rgba(0,0,0,0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  blurInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ctaBox: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadow.md,
    marginTop: spacing.md,
  },
  ctaTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: colors.textPrimary, marginBottom: spacing.sm },
  ctaSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 20 },
  ctaBtn: { borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: spacing.xl },
  ctaBtnText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#000' },
});
