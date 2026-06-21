import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator,
  SafeAreaView, ScrollView, Alert, Platform, FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, shadow } from '../constants/theme';
import { t, SPORTS } from '../constants/i18n';
import { ExerciseType, Language, RootStackParamList } from '../types';
import { scoreOutfit } from '../services/scoring';
import { getLanguage, getWeeklyChallengeCount, isPremiumUnlocked } from '../services/storage';
import ChallengeBar from '../components/ChallengeBar';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export default function CameraScreen() {
  const nav = useNavigation<Nav>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [exerciseType, setExerciseType] = useState<ExerciseType>('running');
  const [scoring, setScoring] = useState(false);
  const [lang, setLang] = useState<Language>('es');
  const [challengeCount, setChallengeCount] = useState(0);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getLanguage().then(setLang);
      getWeeklyChallengeCount().then(setChallengeCount);
      isPremiumUnlocked().then(setPremiumUnlocked);
    }, []),
  );

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sin acceso', 'Necesitamos acceso a tu galería para seleccionar fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function openCamera() {
    if (Platform.OS === 'web') {
      await pickFromGallery();
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sin acceso', 'Necesitamos acceso a tu cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function handleScore() {
    if (!imageUri) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScoring(true);
    try {
      const result = await scoreOutfit(imageUri, exerciseType, lang);
      nav.navigate('Score', { imageUri, exerciseType, result });
    } finally {
      setScoring(false);
    }
  }

  const selectedSport = SPORTS.find(s => s.key === exerciseType);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={styles.title}>{t('cameraTitle', lang)}</Text>

        {/* Challenge bar */}
        <ChallengeBar count={challengeCount} lang={lang} unlocked={premiumUnlocked} />

        {/* ── Viewfinder ── */}
        <View style={styles.viewfinder}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={styles.viewfinderEmpty}>
              <Ionicons name="person-outline" size={56} color="rgba(255,255,255,0.25)" />
              <Text style={styles.viewfinderHint}>{t('cameraSubtitle', lang)}</Text>
            </View>
          )}

          {/* Corner brackets */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        {/* ── Camera controls ── */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={pickFromGallery} style={styles.controlBtn} activeOpacity={0.75}>
            <Ionicons name="images-outline" size={24} color={colors.textPrimary} />
            <Text style={styles.controlLabel}>{t('cameraPickPhoto', lang)}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={openCamera} style={styles.shutter} activeOpacity={0.85}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          {/* Placeholder for balance — or tap viewfinder to remove photo */}
          {imageUri ? (
            <TouchableOpacity onPress={() => setImageUri(null)} style={styles.controlBtn} activeOpacity={0.75}>
              <Ionicons name="trash-outline" size={24} color={colors.scoreLow} />
              <Text style={[styles.controlLabel, { color: colors.scoreLow }]}>Quitar</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.controlBtn} />
          )}
        </View>

        {/* ── Sport selector ── */}
        <Text style={styles.sectionLabel}>{t('cameraExerciseLabel', lang)}</Text>

        {/* Dropdown trigger */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDropdown(v => !v)}
          activeOpacity={0.8}
        >
          {selectedSport && (
            <MaterialCommunityIcons name={selectedSport.icon as any} size={20} color={colors.accentBlue} />
          )}
          <Text style={styles.dropdownValue}>
            {selectedSport ? (lang === 'es' ? selectedSport.labelEs : selectedSport.labelEn) : '—'}
          </Text>
          <Ionicons
            name={showDropdown ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Dropdown list */}
        {showDropdown && (
          <View style={styles.dropdownList}>
            {SPORTS.map(sport => {
              const active = exerciseType === sport.key;
              return (
                <TouchableOpacity
                  key={sport.key}
                  style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                  onPress={() => { setExerciseType(sport.key); setShowDropdown(false); }}
                  activeOpacity={0.75}
                >
                  <MaterialCommunityIcons
                    name={sport.icon as any}
                    size={18}
                    color={active ? colors.accentBlue : colors.textSecondary}
                  />
                  <Text style={[styles.dropdownItemText, active && styles.dropdownItemTextActive]}>
                    {lang === 'es' ? sport.labelEs : sport.labelEn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── CTA ── */}
        <TouchableOpacity
          style={[styles.cta, (!imageUri || scoring) && styles.ctaDisabled]}
          onPress={handleScore}
          disabled={!imageUri || scoring}
          activeOpacity={0.85}
        >
          {scoring ? (
            <View style={styles.ctaInner}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.ctaText}>{t('cameraScoring', lang)}</Text>
            </View>
          ) : (
            <Text style={styles.ctaText}>{t('cameraSubmit', lang)}</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const CORNER = 22;
const BORDER = 3;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },

  title: {
    fontSize: 34,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: 0.3,
  },

  // ── Viewfinder ──
  viewfinder: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#111',
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadow.md,
  },
  viewfinderEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  viewfinderHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Corner brackets
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
  },
  cornerTL: { top: 14, left: 14, borderTopWidth: BORDER, borderLeftWidth: BORDER, borderColor: '#FFFFFF', borderTopLeftRadius: 4 },
  cornerTR: { top: 14, right: 14, borderTopWidth: BORDER, borderRightWidth: BORDER, borderColor: '#FFFFFF', borderTopRightRadius: 4 },
  cornerBL: { bottom: 14, left: 14, borderBottomWidth: BORDER, borderLeftWidth: BORDER, borderColor: '#FFFFFF', borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 14, right: 14, borderBottomWidth: BORDER, borderRightWidth: BORDER, borderColor: '#FFFFFF', borderBottomRightRadius: 4 },

  // ── Controls ──
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  controlBtn: {
    width: 72,
    alignItems: 'center',
    gap: 4,
  },
  controlLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  shutter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    ...shadow.md,
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
  },

  // ── Sport selector ──
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  dropdownValue: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.accentBlue,
  },
  dropdownList: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadow.md,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  dropdownItemActive: {
    backgroundColor: '#F0FFF0',
  },
  dropdownItemText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
  dropdownItemTextActive: {
    color: colors.accentBlue,
    fontFamily: 'Inter_600SemiBold',
  },

  // ── CTA ──
  cta: {
    backgroundColor: colors.accentBlue,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadow.md,
  },
  ctaDisabled: { opacity: 0.38 },
  ctaInner: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  ctaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
  },
});
