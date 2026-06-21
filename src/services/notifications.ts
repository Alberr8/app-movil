import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Language } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIFICATION_ID = 'sportstyle-daily-reminder';

const messages: Record<Language, { title: string; body: string }> = {
  es: {
    title: 'Sportstyle 💪',
    body: '¿Has hecho ya deporte y no has subido tu outfit? ¡A qué esperas!',
  },
  en: {
    title: 'Sportstyle 💪',
    body: 'Did you work out today and forgot your outfit? Don\'t wait!',
  },
};

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(lang: Language): Promise<void> {
  if (Platform.OS === 'web') return;
  await cancelDailyReminder();
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const msg = messages[lang];
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_ID,
    content: {
      title: msg.title,
      body: msg.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
  } catch {
    // ignore if not scheduled
  }
}
