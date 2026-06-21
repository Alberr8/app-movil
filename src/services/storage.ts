import AsyncStorage from '@react-native-async-storage/async-storage';
import { Outfit, Language } from '../types';
import { supabase } from './supabase';

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

// ─── Outfits ──────────────────────────────────────────────────────────────────
// Write: cache first, then sync to Supabase in background
export async function saveOutfit(outfit: Outfit): Promise<{ challengeCount: number; premiumUnlocked: boolean }> {
  const existing = await getOutfits();
  const updated = [outfit, ...existing];
  await AsyncStorage.setItem(KEYS.outfits, JSON.stringify(updated));

  // Sync to Supabase in background (non-blocking)
  supabase.auth.getUser().then(({ data }) => {
    if (!data.user) return;
    supabase.from('outfits').insert({
      id: outfit.id,
      user_id: data.user.id,
      image_uri: outfit.imageUri,
      exercise_type: outfit.exerciseType,
      score: outfit.score,
      week_key: outfit.weekKey,
      created_at: outfit.createdAt,
    }).then(({ error }) => {
      if (error) console.warn('[storage] outfit sync failed:', error.message);
    });
  });

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

// Read: return cache immediately, refresh from Supabase in background
export async function getOutfits(): Promise<Outfit[]> {
  const raw = await AsyncStorage.getItem(KEYS.outfits);
  const cached: Outfit[] = raw ? JSON.parse(raw) : [];

  // Background refresh from Supabase
  supabase.auth.getUser().then(({ data }) => {
    if (!data.user) return;
    supabase
      .from('outfits')
      .select('*')
      .eq('user_id', data.user.id)
      .order('created_at', { ascending: false })
      .then(({ data: rows, error }) => {
        if (error || !rows) return;
        const remote: Outfit[] = rows.map(r => ({
          id: r.id,
          imageUri: r.image_uri,
          exerciseType: r.exercise_type,
          score: r.score,
          createdAt: r.created_at,
          weekKey: r.week_key,
        }));
        AsyncStorage.setItem(KEYS.outfits, JSON.stringify(remote));
      });
  });

  return cached;
}

export async function deleteOutfit(id: string): Promise<void> {
  const existing = await getOutfits();
  const updated = existing.filter(o => o.id !== id);
  await AsyncStorage.setItem(KEYS.outfits, JSON.stringify(updated));

  supabase.auth.getUser().then(({ data }) => {
    if (!data.user) return;
    supabase.from('outfits').delete().eq('id', id).eq('user_id', data.user.id);
  });
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

// ─── Profile preferences ──────────────────────────────────────────────────────
// Write to cache + sync profile row in Supabase
async function syncProfile(patch: Record<string, unknown>) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  supabase.from('profiles').upsert({ id: data.user.id, ...patch });
}

export async function getLanguage(): Promise<Language> {
  const lang = await AsyncStorage.getItem(KEYS.language);
  return (lang as Language) ?? 'es';
}

export async function setLanguage(lang: Language): Promise<void> {
  await AsyncStorage.setItem(KEYS.language, lang);
  syncProfile({ language: lang });
}

export async function getUserName(): Promise<string> {
  return (await AsyncStorage.getItem(KEYS.userName)) ?? '';
}

export async function setUserName(name: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.userName, name);
  syncProfile({ name });
}

export async function getNotificationsEnabled(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.notificationsEnabled);
  return val !== 'false';
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.notificationsEnabled, String(enabled));
  syncProfile({ notifications_enabled: enabled });
}

export async function getStats(): Promise<{ total: number; avg: number; best: number }> {
  const outfits = await getOutfits();
  if (outfits.length === 0) return { total: 0, avg: 0, best: 0 };
  const scores = outfits.map(o => o.score.total);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const best = Math.max(...scores);
  return { total: outfits.length, avg: Math.round(avg * 10) / 10, best };
}
