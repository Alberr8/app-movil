import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, radius, shadow } from '../constants/theme';
import { RootStackParamList, ExerciseType } from '../types';
import { SPORTS } from '../constants/i18n';
import { supabase } from '../services/supabase';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const BRANDS = [
  { id: 'nike',        label: 'Nike',         icon: '👟' },
  { id: 'adidas',      label: 'Adidas',        icon: '🔱' },
  { id: 'lululemon',   label: 'Lululemon',     icon: '🧘' },
  { id: 'gymshark',    label: 'Gymshark',      icon: '🦈' },
  { id: 'underarmour', label: 'Under Armour',  icon: '🛡️' },
  { id: 'newbalance',  label: 'New Balance',   icon: '🏃' },
  { id: 'asics',       label: 'ASICS',         icon: '⚡' },
  { id: 'onrunning',   label: 'On Running',    icon: '☁️' },
  { id: 'salomon',     label: 'Salomon',       icon: '🏔️' },
  { id: 'patagonia',   label: 'Patagonia',     icon: '🌿' },
  { id: 'arcteryx',    label: "Arc'teryx",     icon: '🦅' },
  { id: 'puma',        label: 'Puma',          icon: '🐆' },
  { id: 'reebok',      label: 'Reebok',        icon: '💪' },
  { id: 'northface',   label: 'The North Face',icon: '⛰️' },
  { id: 'decathlon',   label: 'Decathlon',     icon: '🏅' },
  { id: 'babolat',     label: 'Babolat',       icon: '🎾' },
  { id: 'bullpadel',   label: 'Bullpadel',     icon: '🏓' },
  { id: 'aloyoga',     label: 'Alo Yoga',      icon: '🌸' },
];

export default function OnboardingScreen() {
  const nav = useNavigation<Nav>();
  const [step, setStep] = useState(0);
  const [selectedSports, setSelectedSports] = useState<ExerciseType[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  function toggleSport(key: ExerciseType) {
    setSelectedSports(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  }

  function toggleBrand(id: string) {
    setSelectedBrands(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  }

  async function handleFinish() {
    await AsyncStorage.setItem('@sportstyle/onboardingDone', 'true');
    await AsyncStorage.setItem('@sportstyle/favSports', JSON.stringify(selectedSports));
    await AsyncStorage.setItem('@sportstyle/favBrands', JSON.stringify(selectedBrands));

    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const uid = data.user.id;

      // Resolve sport keys → sport ids
      if (selectedSports.length > 0) {
        const { data: sportRows } = await supabase
          .from('sports')
          .select('id, key')
          .in('key', selectedSports);
        if (sportRows && sportRows.length > 0) {
          await supabase.from('user_sports').delete().eq('user_id', uid);
          await supabase.from('user_sports').insert(
            sportRows.map(s => ({ user_id: uid, sport_id: s.id }))
          );
        }
      }

      // Resolve brand keys → brand ids
      if (selectedBrands.length > 0) {
        const { data: brandRows } = await supabase
          .from('brands')
          .select('id, key')
          .in('key', selectedBrands);
        if (brandRows && brandRows.length > 0) {
          await supabase.from('user_brands').delete().eq('user_id', uid);
          await supabase.from('user_brands').insert(
            brandRows.map(b => ({ user_id: uid, brand_id: b.id }))
          );
        }
      }
    }

    nav.replace('Main');
  }

  // ── Step 0: Hero ──────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.heroScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.tagline}>El estilo{'\n'}también{'\n'}entrena.</Text>
            <Text style={styles.taglineSub}>
              La primera app que puntúa tu outfit deportivo y te dice exactamente cómo mejorar.
            </Text>
          </View>

          <View style={styles.featureList}>
            {[
              { icon: 'camera-outline', text: 'Sube tu look y recibe una nota del 1 al 10' },
              { icon: 'trophy-outline', text: '3 outfits ≥9 en una semana → Premium gratis' },
              { icon: 'shirt-outline',  text: 'Armario virtual con tus mejores looks' },
              { icon: 'bag-handle-outline', text: 'Recomendaciones de prendas personalizadas' },
            ].map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={f.icon as any} size={22} color={colors.accentBlue} />
                </View>
                <Text style={styles.featureRowText}>{f.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.cta} onPress={() => setStep(1)} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Personalizar mi experiencia</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.fine}>Gratis · Sin suscripción · Sin anuncios</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Step 1: Deportes ──────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.stepHeader}>
          <ProgressBar step={1} total={2} />
          <Text style={styles.stepTitle}>¿Cuáles son tus deportes?</Text>
          <Text style={styles.stepSub}>Selecciona todos los que practiques</Text>
        </View>
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {SPORTS.map(sport => {
            const active = selectedSports.includes(sport.key);
            return (
              <TouchableOpacity
                key={sport.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleSport(sport.key)}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons
                  name={sport.icon as any}
                  size={18}
                  color={active ? '#000' : colors.textSecondary}
                />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {sport.labelEs}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navBack} onPress={() => setStep(0)} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navNext} onPress={() => setStep(2)} activeOpacity={0.85}>
            <Text style={styles.navNextText}>
              {selectedSports.length > 0 ? `Siguiente (${selectedSports.length})` : 'Saltar'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Step 2: Marcas ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.stepHeader}>
        <ProgressBar step={2} total={2} />
        <Text style={styles.stepTitle}>¿Tus marcas favoritas?</Text>
        <Text style={styles.stepSub}>Las usaremos para personalizar tus recomendaciones</Text>
      </View>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {BRANDS.map(brand => {
          const active = selectedBrands.includes(brand.id);
          return (
            <TouchableOpacity
              key={brand.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggleBrand(brand.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.brandEmoji}>{brand.icon}</Text>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {brand.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBack} onPress={() => setStep(1)} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navNext} onPress={handleFinish} activeOpacity={0.85}>
          <Text style={styles.navNextText}>
            {selectedBrands.length > 0 ? `Empezar (${selectedBrands.length})` : 'Empezar'}
          </Text>
          <Ionicons name="checkmark" size={18} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={pb.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[pb.seg, i < step && pb.segActive]} />
      ))}
    </View>
  );
}

const pb = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginBottom: spacing.md },
  seg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.separator },
  segActive: { backgroundColor: colors.accentBlue },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Hero
  heroScroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: { paddingTop: spacing.xl, paddingBottom: spacing.xl },
  tagline: {
    fontSize: 44,
    fontFamily: 'Inter_800ExtraBold',
    color: colors.textPrimary,
    lineHeight: 50,
    letterSpacing: -1,
    marginBottom: spacing.md,
  },
  taglineSub: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    lineHeight: 24,
  },

  featureList: { gap: spacing.sm, marginBottom: spacing.xl },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.sm,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureRowText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentBlue,
    borderRadius: radius.md,
    paddingVertical: 16,
    marginBottom: spacing.md,
    ...shadow.md,
  },
  ctaText: { fontFamily: 'Inter_700Bold', fontSize: 17, color: '#000' },
  fine: {
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textTertiary,
  },

  // Steps
  stepHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  stepTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stepSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...shadow.sm,
  },
  chipActive: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentBlue,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: { color: '#000', fontFamily: 'Inter_600SemiBold' },
  brandEmoji: { fontSize: 16 },

  // Nav bar
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  navBack: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  navNext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentBlue,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    ...shadow.md,
  },
  navNextText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#000' },
});
