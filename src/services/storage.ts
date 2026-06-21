import AsyncStorage from '@react-native-async-storage/async-storage';
import { Outfit, Language } from '../types';

const KEYS = {
  outfits: '@sportstyle/outfits',
  language: '@sportstyle/language',
  userName: '@sportstyle/userName',
  premiumUntil: '@sportstyle/premiumUntil',
  notificationsEnabled: '@sportstyle/notifications',
};

export function getWeekKey(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function getWeekEnd(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function saveOutfit(outfit: Outfit): Promise<{ challengeCount: number; premiumUnlocked: boolean }> {
  const existing = await getOutfits();
  const updated = [outfit, ...existing];
  await AsyncStorage.setItem(KEYS.outfits, JSON.stringify(updated));

  const weekKey = getWeekKey();
  const weekHighScores = updated.filter(o => o.weekKey === weekKey && o.score.total >= 9);
  const count = weekHighScores.length;
  let premiumUnlocked = false;

  if (count >= 3) {
    const until = getWeekEnd().toISOString();
    await AsyncStorage.setItem(KEYS.premiumUntil, until);
    premiumUnlocked = true;
  }

  return { challengeCount: count, premiumUnlocked };
}

export async function getOutfits(): Promise<Outfit[]> {
  const raw = await AsyncStorage.getItem(KEYS.outfits);
  if (!raw) return [];
  return JSON.parse(raw) as Outfit[];
}

export async function deleteOutfit(id: string): Promise<void> {
  const existing = await getOutfits();
  const updated = existing.filter(o => o.id !== id);
  await AsyncStorage.setItem(KEYS.outfits, JSON.stringify(updated));
}

export async function getWeeklyChallengeCount(): Promise<number> {
  const outfits = await getOutfits();
  const weekKey = getWeekKey();
  return outfits.filter(o => o.weekKey === weekKey && o.score.total >= 9).length;
}

export async function isPremiumUnlocked(): Promise<boolean> {
  const until = await AsyncStorage.getItem(KEYS.premiumUntil);
  if (!until) return false;
  return new Date(until) > new Date();
}

export async function getLanguage(): Promise<Language> {
  const lang = await AsyncStorage.getItem(KEYS.language);
  return (lang as Language) ?? 'es';
}

export async function setLanguage(lang: Language): Promise<void> {
  await AsyncStorage.setItem(KEYS.language, lang);
}

export async function getUserName(): Promise<string> {
  return (await AsyncStorage.getItem(KEYS.userName)) ?? '';
}

export async function setUserName(name: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.userName, name);
}

export async function getNotificationsEnabled(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.notificationsEnabled);
  return val !== 'false';
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.notificationsEnabled, String(enabled));
}

export async function getStats(): Promise<{ total: number; avg: number; best: number }> {
  const outfits = await getOutfits();
  if (outfits.length === 0) return { total: 0, avg: 0, best: 0 };
  const scores = outfits.map(o => o.score.total);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const best = Math.max(...scores);
  return { total: outfits.length, avg: Math.round(avg * 10) / 10, best };
}
