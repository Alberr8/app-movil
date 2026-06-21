import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Linking, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { spacing, radius } from '../constants/theme';
import { Language } from '../types';
import { t } from '../constants/i18n';

interface Props {
  score: number;
  imageUri: string;
  lang: Language;
}

const APPS = [
  {
    key: 'whatsapp',
    icon: 'whatsapp',
    color: '#25D366',
    label: (lang: Language) => t('shareWhatsApp', lang) as string,
    handle: async (text: string) => {
      const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
      const web = `https://wa.me/?text=${encodeURIComponent(text)}`;
      const ok = await Linking.canOpenURL(url).catch(() => false);
      Linking.openURL(ok ? url : web).catch(() => {});
    },
  },
  {
    key: 'instagram',
    icon: 'instagram',
    color: '#C13584',
    label: (lang: Language) => t('shareInstagram', lang) as string,
    handle: async (text: string) => {
      if (Platform.OS === 'web') {
        await Share.share({ message: text });
        return;
      }
      const url = 'instagram://app';
      const ok = await Linking.canOpenURL(url).catch(() => false);
      Linking.openURL(ok ? url : 'https://www.instagram.com').catch(() => {});
    },
  },
  {
    key: 'strava',
    icon: 'strava',
    color: '#FC4C02',
    label: (lang: Language) => t('shareStrava', lang) as string,
    handle: async (_text: string) => {
      const url = 'strava://';
      const ok = await Linking.canOpenURL(url).catch(() => false);
      Linking.openURL(ok ? url : 'https://www.strava.com').catch(() => {});
    },
  },
] as const;

export default function ShareSheet({ score, lang }: Props) {
  const text =
    lang === 'es'
      ? `Mi outfit deportivo ha conseguido un ${score}/10 en Sportstyle. #Sportstyle #SportFashion`
      : `My sports outfit scored ${score}/10 on Sportstyle. #Sportstyle #SportFashion`;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('scoreShare', lang)}</Text>
      <View style={styles.row}>
        {APPS.map(app => (
          <TouchableOpacity
            key={app.key}
            onPress={() => app.handle(text)}
            activeOpacity={0.78}
            style={styles.btn}
          >
            <View style={[styles.iconWrap, { backgroundColor: app.color }]}>
              <FontAwesome5 name={app.icon} size={22} color="#FFFFFF" solid={false} />
            </View>
            <Text style={styles.btnLabel}>{app.label(lang)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: spacing.md },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  btn: { alignItems: 'center', gap: 6 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.2,
  },
});
