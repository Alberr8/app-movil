import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,
  SafeAreaView, Animated, Platform, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, radius, shadow } from '../constants/theme';
import { t } from '../constants/i18n';
import { RootStackParamList, Language, Outfit, ProductRecommendation } from '../types';
import { getLanguage, saveOutfit, getWeekKey } from '../services/storage';
import ScoreRing from '../components/ScoreRing';
import ShareSheet from '../components/ShareSheet';

type Route = RouteProp<RootStackParamList, 'Score'>;

const BREAKDOWN_KEYS = ['scoreCoordination', 'scoreFit', 'scoreAppropriateness', 'scoreTrend', 'scoreCompleteness'] as const;
const BREAKDOWN_FIELDS = ['coordination', 'fit', 'appropriateness', 'trend', 'completeness'] as const;

function ProductCard({ product, lang }: { product: ProductRecommendation; lang: Language }) {
  function open() {
    Linking.openURL(product.url).catch(() => {});
  }

  const tagLabel = product.type === 'replace'
    ? (t('scoreProductReplace', lang) as string)
    : (t('scoreProductAdd', lang) as string);

  const tagColor = product.type === 'replace' ? colors.scoreMid : colors.accentBlue;

  return (
    <TouchableOpacity onPress={open} activeOpacity={0.82} style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productTitleRow}>
          <Text style={styles.productBrand}>{product.brand}</Text>
          <View style={[styles.productTag, { backgroundColor: tagColor }]}>
            <Text style={styles.productTagText}>{tagLabel}</Text>
          </View>
        </View>
        <Text style={styles.productName}>{product.name}</Text>
      </View>
      <Text style={styles.productReason}>{product.reason}</Text>
      <View style={styles.productLink}>
        <Text style={styles.productLinkText}>Ver producto</Text>
        <Ionicons name="arrow-forward" size={14} color={colors.accentBlue} />
      </View>
    </TouchableOpacity>
  );
}

export default function ScoreScreen() {
  const nav = useNavigation();
  const route = useRoute<Route>();
  const { imageUri, exerciseType, result } = route.params;

  const [lang, setLang] = useState<Language>('es');
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const barAnims = useRef(BREAKDOWN_FIELDS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    getLanguage().then(setLang);
  }, []);

  useEffect(() => {
    Animated.stagger(
      80,
      BREAKDOWN_FIELDS.map((field, i) =>
        Animated.timing(barAnims[i], {
          toValue: result.breakdown[field] / 2,
          duration: 900 + i * 120,
          delay: 400,
          useNativeDriver: false,
        }),
      ),
    ).start();
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }

  async function handleSave() {
    if (saved) return;
    const outfit: Outfit = {
      id: Date.now().toString(),
      imageUri,
      exerciseType,
      score: result,
      createdAt: new Date().toISOString(),
      weekKey: getWeekKey(),
    };
    const { challengeCount, premiumUnlocked } = await saveOutfit(outfit);
    setSaved(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (premiumUnlocked && challengeCount === 3) {
      showToast(t('scoreChallengeComplete', lang) as string);
    } else if (result.total >= 9) {
      showToast((t('scoreChallengeProgress', lang) as (n: number) => string)(challengeCount));
    } else {
      showToast(t('scoreSaved', lang) as string);
    }
    setTimeout(() => nav.goBack(), 2800);
  }

  const scoreColor = result.total >= 8 ? colors.scoreHigh : result.total >= 5 ? colors.scoreMid : colors.scoreLow;

  return (
    <View style={styles.root}>
      <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.94)']}
        style={StyleSheet.absoluteFill}
      />

      {toast && (
        <Animated.View style={[styles.toast, { opacity: toastAnim }]}>
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      )}

      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.back} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Score ring */}
          <View style={styles.ringArea}>
            <ScoreRing score={result.total} size={160} />
          </View>

          {/* Basis */}
          <Text style={styles.basis}>{result.basis}</Text>

          {/* Breakdown bars */}
          <View style={styles.card}>
            {BREAKDOWN_FIELDS.map((field, i) => (
              <View key={field} style={styles.barRow}>
                <Text style={styles.barLabel}>{t(BREAKDOWN_KEYS[i], lang)}</Text>
                <View style={styles.barTrack}>
                  <Animated.View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: scoreColor,
                        width: barAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barScore}>{result.breakdown[field]}/2</Text>
              </View>
            ))}
          </View>

          {/* Recommendations */}
          <Text style={styles.sectionTitle}>{t('scoreRecommendations', lang)}</Text>
          {result.recommendations.map((rec, i) => (
            <View key={i} style={styles.recCard}>
              <Text style={styles.recNum}>{i + 1}</Text>
              <Text style={styles.recText}>{rec}</Text>
            </View>
          ))}

          {/* Product recommendations */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>{t('scoreProducts', lang)}</Text>
          {result.products.map((p, i) => (
            <ProductCard key={i} product={p} lang={lang} />
          ))}

          {/* Share */}
          <ShareSheet score={result.total} imageUri={imageUri} lang={lang} />

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnDone]}
            onPress={handleSave}
            disabled={saved}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {saved
                ? `${t('scoreSaved', lang)}`
                : `${t('scoreSave', lang)}`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  safe: { flex: 1 },
  back: {
    margin: spacing.md,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  ringArea: { alignItems: 'center', marginVertical: spacing.xl },
  basis: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  barLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    width: 100,
  },
  barTrack: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  barScore: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#FFF',
    width: 26,
    textAlign: 'right',
  },

  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  recCard: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  recNum: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: colors.accentBlue,
    width: 18,
  },
  recText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
    lineHeight: 21,
  },

  // ── Product cards ──
  productCard: {
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  productHeader: { marginBottom: spacing.sm },
  productTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productBrand: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  productTag: {
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  productTagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  productReason: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  productLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productLinkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.accentBlue,
  },

  // ── Bottom ──
  saveBtn: {
    backgroundColor: colors.accentBlue,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadow.md,
  },
  saveBtnDone: { backgroundColor: colors.scoreHigh },
  saveBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  toast: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.88)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    zIndex: 100,
  },
  toastText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
