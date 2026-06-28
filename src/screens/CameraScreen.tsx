import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator,
  SafeAreaView, Alert, Platform, ScrollView, Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, shadow } from '../constants/theme';
import { t, SPORTS } from '../constants/i18n';
import { ExerciseType, Language, RootStackParamList } from '../types';
import { scoreOutfit } from '../services/scoring';
import { getLanguage, getWeeklyChallengeCount, isPremiumUnlocked } from '../services/storage';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;
const { width } = Dimensions.get('window');
const FRAME_W = width * 0.70;
const FRAME_H = FRAME_W * 1.28;
const CORNER_SIZE = 24;
const CORNER_W = 3;

export default function CameraScreen() {
  const nav = useNavigation<Nav>();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [exerciseType, setExerciseType] = useState<ExerciseType>('running');
  const [scoring, setScoring] = useState(false);
  const [lang, setLang] = useState<Language>('es');
  const [challengeCount, setChallengeCount] = useState(0);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [flash, setFlash] = useState<FlashMode>('off');

  useFocusEffect(
    useCallback(() => {
      getLanguage().then(setLang);
      getWeeklyChallengeCount().then(setChallengeCount);
      isPremiumUnlocked().then(setPremiumUnlocked);
    }, []),
  );

  async function takePhoto() {
    if (!cameraRef.current) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo) setImageUri(photo.uri);
    } catch {
      // fallback to image picker if camera capture fails
      await pickFromGallery();
    }
  }

  async function pickFromGallery() {
    // Web uses a native file input — no media library permission needed
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          lang === 'es' ? 'Sin acceso' : 'No access',
          lang === 'es' ? 'Necesitamos acceso a tu galería.' : 'We need gallery access.',
        );
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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

  const isWeb = Platform.OS === 'web';
  const selectedSport = SPORTS.find(s => s.key === exerciseType);
  const sportLabel = selectedSport ? (lang === 'es' ? selectedSport.labelEs : selectedSport.labelEn) : '';
  const pipCount = Math.min(challengeCount, 3);

  // ── Permission loading (native only) ──
  if (!isWeb && !permission) return <View style={styles.root} />;

  // ── Permission denied (native only) ──
  if (!isWeb && permission && !permission.granted) {
    return (
      <SafeAreaView style={[styles.root, styles.permScreen]}>
        <Ionicons name="camera-outline" size={64} color="rgba(255,255,255,0.22)" />
        <Text style={styles.permTitle}>
          {lang === 'es' ? 'Acceso a la cámara' : 'Camera access'}
        </Text>
        <Text style={styles.permSub}>
          {lang === 'es'
            ? 'Para escanear tu outfit necesitamos acceso a la cámara'
            : 'To scan your outfit we need camera access'}
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.85}>
          <Text style={styles.permBtnText}>
            {lang === 'es' ? 'Permitir acceso' : 'Allow access'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.permGallery} onPress={pickFromGallery} activeOpacity={0.75}>
          <Ionicons name="images-outline" size={18} color="rgba(255,255,255,0.50)" />
          <Text style={styles.permGalleryText}>
            {lang === 'es' ? 'Elegir de galería' : 'Choose from gallery'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      {/* ── Live camera preview (native only) ── */}
      {!isWeb && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          flash={flash}
        />
      )}

      {/* ── Captured / picked photo on top ── */}
      {imageUri && (
        <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      )}

      {/* ── Gradient overlays ── */}
      <LinearGradient
        colors={['rgba(0,0,0,0.52)', 'transparent']}
        style={styles.gradientTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.52)', 'rgba(0,0,0,0.96)']}
        locations={[0.40, 0.70, 1]}
        style={styles.gradientBottom}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe}>
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          {/* Weekly challenge pips */}
          <View style={styles.pipsRow}>
            {[0, 1, 2].map(i => (
              <View
                key={i}
                style={[styles.pip, i < pipCount && (premiumUnlocked ? styles.pipPremium : styles.pipActive)]}
              />
            ))}
          </View>

          {/* Sport selector pill */}
          <TouchableOpacity style={styles.sportPill} onPress={() => setShowDropdown(v => !v)} activeOpacity={0.8}>
            {selectedSport && (
              <MaterialCommunityIcons name={selectedSport.icon as any} size={14} color={colors.accentBlue} />
            )}
            <Text style={styles.sportPillText} numberOfLines={1}>{sportLabel}</Text>
            <Ionicons name={showDropdown ? 'chevron-up' : 'chevron-down'} size={12} color="rgba(255,255,255,0.55)" />
          </TouchableOpacity>
        </View>

        {/* ── Sport dropdown ── */}
        {showDropdown && (
          <View style={styles.dropdown}>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
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
                      size={16}
                      color={active ? colors.accentBlue : 'rgba(255,255,255,0.55)'}
                    />
                    <Text style={[styles.dropdownItemText, active && styles.dropdownItemTextActive]}>
                      {lang === 'es' ? sport.labelEs : sport.labelEn}
                    </Text>
                    {active && <Ionicons name="checkmark" size={15} color={colors.accentBlue} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── Web: upload hint when no photo ── */}
        {isWeb && !imageUri && (
          <View style={styles.emptyArea}>
            <Ionicons name="cloud-upload-outline" size={52} color="rgba(255,255,255,0.25)" />
            <Text style={styles.emptyTitle}>{t('cameraTitle', lang)}</Text>
            <Text style={styles.emptyHint}>
              {lang === 'es' ? 'Pulsa el botón para subir una foto' : 'Tap the button to upload a photo'}
            </Text>
          </View>
        )}

        {/* ── Corner-bracket scan frame (native live preview only) ── */}
        {!isWeb && !imageUri && (
          <View style={styles.scanFrame} pointerEvents="none">
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        )}

        <View style={{ flex: 1 }} />

        {/* ── Bottom controls ── */}
        <View style={styles.bottomControls}>
          {/* Analyze CTA — only when photo selected */}
          {imageUri && (
            <TouchableOpacity
              style={[styles.scoreBtn, scoring && styles.scoreBtnLoading]}
              onPress={handleScore}
              disabled={scoring}
              activeOpacity={0.85}
            >
              {scoring ? (
                <>
                  <ActivityIndicator color="#000" size="small" />
                  <Text style={styles.scoreBtnText}>{t('cameraScoring', lang)}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="flash" size={18} color="#000" />
                  <Text style={styles.scoreBtnText}>{t('cameraSubmit', lang)}</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Hint text — only when no photo */}
          {!imageUri && (
            <Text style={styles.hint}>{t('cameraSubtitle', lang)}</Text>
          )}

          {/* Shutter row */}
          <View style={styles.shutterRow}>
            {/* Left: flash toggle (native, no photo) / trash (has photo) / spacer (web) */}
            {imageUri ? (
              <TouchableOpacity style={styles.sideBtn} onPress={() => setImageUri(null)} activeOpacity={0.75}>
                <Ionicons name="trash-outline" size={22} color="rgba(255,90,90,0.85)" />
              </TouchableOpacity>
            ) : !isWeb ? (
              <TouchableOpacity
                style={[styles.sideBtn, flash === 'on' && styles.sideBtnFlashOn]}
                onPress={() => setFlash(f => (f === 'off' ? 'on' : 'off'))}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={flash === 'on' ? 'flash' : 'flash-off-outline'}
                  size={22}
                  color={flash === 'on' ? '#000' : '#FFF'}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.sideBtn} />
            )}

            {/* Center: shutter / retake */}
            {imageUri ? (
              <TouchableOpacity style={styles.retakeBtn} onPress={() => setImageUri(null)} activeOpacity={0.8}>
                <Ionicons name="camera-outline" size={28} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.shutter} onPress={isWeb ? pickFromGallery : takePhoto} activeOpacity={0.85}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            )}

            {/* Right: gallery (always) */}
            <TouchableOpacity style={styles.sideBtn} onPress={pickFromGallery} activeOpacity={0.75}>
              <Ionicons name="images-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0A' },
  safe: { flex: 1 },

  gradientTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 160,
  },
  gradientBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 360,
  },

  // ── Top bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  pipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  pip: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.18)' },
  pipActive:  { backgroundColor: colors.accentBlue },
  pipPremium: { backgroundColor: colors.premium },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    maxWidth: width * 0.52,
  },
  sportPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFF', flex: 1 },

  // ── Dropdown ──
  dropdown: {
    position: 'absolute',
    top: 56,
    right: spacing.md,
    width: 210,
    backgroundColor: '#1C1C1C',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 20,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dropdownItemActive: { backgroundColor: 'rgba(181,253,89,0.09)' },
  dropdownItemText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.65)', flex: 1 },
  dropdownItemTextActive: { fontFamily: 'Inter_600SemiBold', color: '#FFF' },

  // ── Scan frame ──
  scanFrame: {
    position: 'absolute',
    width: FRAME_W,
    height: FRAME_H,
    top: '50%',
    left: '50%',
    marginTop: -(FRAME_H / 2) - 40,
    marginLeft: -(FRAME_W / 2),
  },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W,
    borderColor: 'rgba(255,255,255,0.80)',
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: CORNER_W, borderRightWidth: CORNER_W,
    borderColor: 'rgba(255,255,255,0.80)',
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W,
    borderColor: 'rgba(255,255,255,0.80)',
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W,
    borderColor: 'rgba(255,255,255,0.80)',
    borderBottomRightRadius: 4,
  },

  // ── Web empty state ──
  emptyArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#FFF',
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.40)',
    textAlign: 'center',
  },

  // ── Bottom controls ──
  bottomControls: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.50)',
    textAlign: 'center',
  },
  scoreBtn: {
    backgroundColor: colors.accentBlue,
    borderRadius: radius.lg,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadow.glow,
  },
  scoreBtnLoading: { opacity: 0.65 },
  scoreBtnText: { fontFamily: 'Inter_700Bold', fontSize: 17, color: '#000000' },

  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  sideBtn: {
    width: 52, height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBtnFlashOn: {
    backgroundColor: colors.accentBlue,
  },
  shutter: {
    width: 78, height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' },
  retakeBtn: {
    width: 78, height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Permission screen ──
  permScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  permTitle: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#FFF', textAlign: 'center' },
  permSub: { fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.50)', textAlign: 'center', lineHeight: 22 },
  permBtn: {
    backgroundColor: colors.accentBlue,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  permBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#000000' },
  permGallery: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  permGalleryText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.50)' },
});
