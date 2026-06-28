import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, Switch, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, shadow } from '../constants/theme';
import { t } from '../constants/i18n';
import { Language } from '../types';
import {
  getLanguage, setLanguage, getUserName, setUserName,
  getNotificationsEnabled, setNotificationsEnabled,
  getStats, getWeeklyChallengeCount, isPremiumUnlocked,
  getWeeklyCoachingSummary,
} from '../services/storage';
import { scheduleDailyReminder, cancelDailyReminder, requestNotificationPermission } from '../services/notifications';
import ChallengeBar from '../components/ChallengeBar';

export default function ProfileScreen() {
  const [lang, setLang] = useState<Language>('es');
  const [name, setName] = useState('');
  const [notifs, setNotifs] = useState(true);
  const [stats, setStats] = useState({ total: 0, avg: 0, best: 0 });
  const [challengeCount, setChallengeCount] = useState(0);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [coachingSummary, setCoachingSummary] = useState<string | null>(null);
  const [coachingLoading, setCoachingLoading] = useState(false);
  const [coachingError, setCoachingError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        getLanguage(), getUserName(), getNotificationsEnabled(),
        getStats(), getWeeklyChallengeCount(), isPremiumUnlocked(),
      ]).then(([l, n, notif, s, cc, pu]) => {
        setLang(l as Language); setName(n); setNotifs(notif);
        setStats(s); setChallengeCount(cc); setPremiumUnlocked(pu);
      });
    }, []),
  );

  async function handleGenerateSummary() {
    setCoachingLoading(true);
    setCoachingError(false);
    try {
      const summary = await getWeeklyCoachingSummary(lang, name);
      setCoachingSummary(summary);
    } catch {
      setCoachingError(true);
    } finally {
      setCoachingLoading(false);
    }
  }

  async function handleLangChange(newLang: Language) {
    setLang(newLang);
    await setLanguage(newLang);
    if (notifs) await scheduleDailyReminder(newLang);
  }

  async function handleNotifToggle(val: boolean) {
    setNotifs(val);
    await setNotificationsEnabled(val);
    if (val) {
      if (Platform.OS !== 'web') await requestNotificationPermission();
      await scheduleDailyReminder(lang);
    } else {
      await cancelDailyReminder();
    }
  }

  const initial = name.trim() ? name.trim()[0].toUpperCase() : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('profileTitle', lang)}</Text>

        {/* Avatar + name */}
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial ?? '?'}</Text>
          </View>
          <TextInput
            style={styles.nameInput}
            value={name}
            placeholder={t('profileNamePlaceholder', lang) as string}
            placeholderTextColor={colors.textTertiary}
            onChangeText={setName}
            onEndEditing={() => setUserName(name)}
            returnKeyType="done"
          />
        </View>

        <ChallengeBar count={challengeCount} lang={lang} unlocked={premiumUnlocked} />

        {/* Stats */}
        <Text style={styles.sectionLabel}>{t('profileStats', lang)}</Text>
        <View style={styles.statsRow}>
          {[
            { label: t('profileTotalOutfits', lang) as string, value: stats.total },
            { label: t('profileAvgScore', lang) as string, value: stats.avg || '—' },
            { label: t('profileBestScore', lang) as string, value: stats.best || '—' },
          ].map(item => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Weekly AI coaching */}
        <Text style={styles.sectionLabel}>{t('profileWeeklyCoaching', lang)}</Text>
        <View style={styles.coachingCard}>
          {coachingLoading ? (
            <View style={styles.coachingLoading}>
              <ActivityIndicator color={colors.accentDark} size="small" />
              <Text style={styles.coachingLoadingText}>{t('profileWeeklyCoachingLoading', lang)}</Text>
            </View>
          ) : coachingSummary ? (
            <>
              <View style={styles.coachingNudgeHeader}>
                <Ionicons name="flash" size={14} color={colors.accentDark} />
                <Text style={styles.coachingNudgeLabel}>{t('profileWeeklyCoaching', lang)}</Text>
              </View>
              <Text style={styles.coachingSummaryText}>{coachingSummary}</Text>
              <TouchableOpacity
                onPress={handleGenerateSummary}
                style={styles.coachingRefreshBtn}
                activeOpacity={0.75}
              >
                <Ionicons name="refresh" size={14} color={colors.accentDark} />
                <Text style={styles.coachingRefreshText}>{t('profileWeeklyCoachingRefresh', lang)}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {coachingError && (
                <Text style={styles.coachingErrorText}>
                  {lang === 'es' ? 'Error al conectar. Inténtalo de nuevo.' : 'Connection error. Please try again.'}
                </Text>
              )}
              <TouchableOpacity
                onPress={handleGenerateSummary}
                style={styles.coachingBtn}
                activeOpacity={0.85}
              >
                <Ionicons name="flash-outline" size={16} color="#000000" />
                <Text style={styles.coachingBtnText}>{t('profileWeeklyCoachingBtn', lang)}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Language */}
        <Text style={styles.sectionLabel}>{t('profileLanguage', lang)}</Text>
        <View style={styles.card}>
          <View style={styles.langRow}>
            {(['es', 'en'] as Language[]).map(l => (
              <TouchableOpacity
                key={l}
                onPress={() => handleLangChange(l)}
                style={[styles.langBtn, lang === l && styles.langBtnActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.langBtnText, lang === l && styles.langBtnTextActive]}>
                  {l === 'es' ? `ES — ${t('profileLanguageEs', lang)}` : `EN — ${t('profileLanguageEn', lang)}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>{t('profileNotifications', lang)}</Text>
        <View style={[styles.card, styles.notifRow]}>
          <Text style={styles.notifText}>{t('profileNotifications', lang)}</Text>
          <Switch
            value={notifs}
            onValueChange={handleNotifToggle}
            trackColor={{ false: colors.textTertiary, true: colors.accentBlue }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { fontFamily: 'Inter_700Bold', fontSize: 34, color: colors.textPrimary, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#000000' },
  nameInput: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: colors.textPrimary,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderColor: colors.separator,
    paddingVertical: spacing.sm,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.sm,
  },
  statValue: { fontFamily: 'Inter_800ExtraBold', fontSize: 28, color: colors.textPrimary },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginTop: 2 },
  langRow: { flexDirection: 'row', gap: spacing.sm },
  langBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  langBtnActive: { backgroundColor: colors.accent },
  langBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.textSecondary },
  langBtnTextActive: { color: '#000000' },
  notifRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.textPrimary, flex: 1 },

  // ── Weekly coaching ──
  coachingCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  coachingLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  coachingLoadingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  coachingNudgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  coachingNudgeLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: colors.accentDark,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  coachingSummaryText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  coachingRefreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  coachingRefreshText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.accentDark,
  },
  coachingErrorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.scoreLow,
    marginBottom: spacing.sm,
  },
  coachingBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  coachingBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#000000',
  },
});
