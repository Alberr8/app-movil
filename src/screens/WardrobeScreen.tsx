import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  Modal, Image, ScrollView, Dimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadow } from '../constants/theme';
import { t } from '../constants/i18n';
import { ExerciseType, Language, Outfit } from '../types';
import { getLanguage, getOutfits } from '../services/storage';
import OutfitCard from '../components/OutfitCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.md * 2 - spacing.sm) / 2;
const CELL_H = 34;  // row height for calendar cells
const SEL    = 30;  // selection circle diameter

type Filter = 'all' | ExerciseType;

// ─── Date helpers ─────────────────────────────────────────────────────────────
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isoFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function outfitDate(o: Outfit): string {
  return o.wornDate ?? o.createdAt.slice(0, 10);
}

function generateCalendarDays(month: Date): (string | null)[] {
  const year = month.getFullYear();
  const m = month.getMonth();
  // Monday-start: Mon=0 … Sun=6
  const startDow = (new Date(year, m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(isoFromDate(new Date(year, m, d)));
  // Pad to full weeks so every row has exactly 7 cells
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function chunkWeeks(days: (string | null)[]): (string | null)[][] {
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

// ─── MiniCalendar ─────────────────────────────────────────────────────────────
const DOW_ES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DOW_EN = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

interface MiniCalendarProps {
  month: Date;
  outfitDates: Set<string>;
  selectedDate: string | null;
  lang: Language;
  onSelectDate: (iso: string | null) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function MiniCalendar({ month, outfitDates, selectedDate, lang, onSelectDate, onPrevMonth, onNextMonth }: MiniCalendarProps) {
  const days = generateCalendarDays(month);
  const DOW = lang === 'es' ? DOW_ES : DOW_EN;
  const title = `${lang === 'es' ? MONTHS_ES[month.getMonth()] : MONTHS_EN[month.getMonth()]} ${month.getFullYear()}`;
  const today = todayISO();

  return (
    <View style={calStyles.container}>
      <View style={calStyles.header}>
        <TouchableOpacity onPress={onPrevMonth} style={calStyles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={calStyles.monthTitle}>{title}</Text>
        <TouchableOpacity onPress={onNextMonth} style={calStyles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* DOW header — flex:1 on each letter so columns align perfectly */}
      <View style={calStyles.dowRow}>
        {DOW.map((d, i) => (
          <Text key={i} style={calStyles.dowText}>{d}</Text>
        ))}
      </View>

      {/* Week rows — each row is a flex row so cells fill width evenly */}
      {chunkWeeks(days).map((week, wi) => (
        <View key={wi} style={calStyles.weekRow}>
          {week.map((iso, di) => {
            if (!iso) return <View key={`e-${di}`} style={calStyles.cell} />;
            const isSelected = iso === selectedDate;
            const isToday = iso === today;
            const hasOutfit = outfitDates.has(iso);
            return (
              <TouchableOpacity
                key={iso}
                style={calStyles.cell}
                onPress={() => onSelectDate(isSelected ? null : iso)}
                activeOpacity={0.7}
              >
                <View style={[
                  calStyles.selCircle,
                  isSelected && calStyles.selCircleActive,
                  isToday && !isSelected && calStyles.selCircleToday,
                ]}>
                  <Text style={[
                    calStyles.dayText,
                    isSelected && calStyles.dayTextSelected,
                    isToday && !isSelected && calStyles.dayTextToday,
                  ]}>
                    {parseInt(iso.slice(-2), 10)}
                  </Text>
                </View>
                {hasOutfit && <View style={[calStyles.dot, isSelected && calStyles.dotSelected]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function WardrobeScreen() {
  const nav = useNavigation();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [lang, setLang] = useState<Language>('es');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Outfit | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useFocusEffect(
    useCallback(() => {
      getLanguage().then(setLang);
      getOutfits().then(setOutfits);
    }, []),
  );

  const outfitDates = useMemo(() => new Set(outfits.map(outfitDate)), [outfits]);

  const filtered = useMemo(() => outfits.filter(o =>
    (!selectedDate || outfitDate(o) === selectedDate) &&
    (filter === 'all' || o.exerciseType === filter),
  ), [outfits, selectedDate, filter]);

  const filterOptions: { key: Filter; label: string }[] = [
    { key: 'all',     label: t('wardrobeAll', lang) as string },
    { key: 'running', label: 'Running' },
    { key: 'gym',     label: 'Gym' },
    { key: 'cycling', label: lang === 'es' ? 'Ciclismo' : 'Cycling' },
  ];

  const ListHeader = (
    <View>
      <MiniCalendar
        month={calendarMonth}
        outfitDates={outfitDates}
        selectedDate={selectedDate}
        lang={lang}
        onSelectDate={setSelectedDate}
        onPrevMonth={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
        onNextMonth={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
      />
      <View style={styles.filterRow}>
        {filterOptions.map(f => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.chip, filter === f.key && styles.chipActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const ListEmpty = (
    <View style={styles.empty}>
      {outfits.length === 0 ? (
        <>
          <Ionicons name="shirt-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>{t('wardrobeEmpty', lang)}</Text>
          <Text style={styles.emptySub}>{t('wardrobeEmptySub', lang)}</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => nav.navigate('Camera' as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyBtnText}>{t('wardrobeUpload', lang)}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>
            {lang === 'es' ? 'Sin outfits este día' : 'No outfits this day'}
          </Text>
          <Text style={styles.emptySub}>
            {lang === 'es' ? 'Sube un outfit y elige esta fecha' : 'Upload an outfit and pick this date'}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('wardrobeTitle', lang)}</Text>
        <View style={styles.headerRight}>
          {selectedDate && (
            <TouchableOpacity onPress={() => setSelectedDate(null)} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>{lang === 'es' ? 'Ver todos' : 'See all'}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.count}>{(t('wardrobeOutfits', lang) as (n: number) => string)(filtered.length)}</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            <OutfitCard outfit={item} lang={lang} onPress={() => setSelected(item)} />
          </View>
        )}
      />

      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet">
        {selected && (
          <View style={styles.modal}>
            <Image source={{ uri: selected.imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.88)']} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.modalSafe}>
              <TouchableOpacity onPress={() => setSelected(null)} style={styles.modalClose}>
                <Ionicons name="close" size={18} color="#FFF" />
              </TouchableOpacity>
              <ScrollView contentContainerStyle={styles.modalContent}>
                <Text style={styles.modalScore}>
                  {selected.score.total}
                  <Text style={styles.modalScoreOf}>/10</Text>
                </Text>
                <Text style={styles.modalBasis}>{selected.score.basis}</Text>
                {selected.score.coachingNudge && (
                  <View style={styles.modalNudge}>
                    <Ionicons name="flash" size={13} color={colors.accentDark} style={{ marginRight: 6 }} />
                    <Text style={styles.modalNudgeText}>{selected.score.coachingNudge}</Text>
                  </View>
                )}
                {selected.score.recommendations.map((r, i) => (
                  <View key={i} style={styles.modalRec}>
                    <Text style={styles.modalRecNum}>{i + 1}</Text>
                    <Text style={styles.modalRecText}>{r}</Text>
                  </View>
                ))}
              </ScrollView>
            </SafeAreaView>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { fontFamily: 'Inter_700Bold', fontSize: 34, color: colors.textPrimary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.accentBlue,
  },
  clearBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#000000' },
  count: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textSecondary },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    ...shadow.sm,
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: '#000000' },
  grid: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  row: { gap: spacing.sm },
  empty: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 22, color: colors.textPrimary, textAlign: 'center' },
  emptySub: { fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    backgroundColor: colors.accentBlue,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
  },
  emptyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#000000' },
  modal: { flex: 1, backgroundColor: '#000' },
  modalSafe: { flex: 1 },
  modalClose: {
    margin: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  modalContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  modalScore: { fontFamily: 'Inter_800ExtraBold', fontSize: 72, color: '#FFF', textAlign: 'center', marginVertical: spacing.lg },
  modalScoreOf: { fontFamily: 'Inter_400Regular', fontSize: 28, color: 'rgba(255,255,255,0.5)' },
  modalBasis: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontStyle: 'italic', marginBottom: spacing.lg },
  modalRec: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  modalRecNum: { fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.accentBlue, width: 18 },
  modalRecText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#FFF', flex: 1, lineHeight: 21 },
  modalNudge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(101,195,1,0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(101,195,1,0.28)',
    padding: 12,
    marginBottom: 12,
  },
  modalNudgeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.90)',
    flex: 1,
    lineHeight: 19,
  },
});

// ─── Calendar styles ──────────────────────────────────────────────────────────
const calStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    padding: 12,
    ...shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.background,
  },
  monthTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.textPrimary },
  dowRow: { flexDirection: 'row', marginBottom: 2, marginTop: 4 },
  weekRow: { flexDirection: 'row' },
  cell: {
    flex: 1,
    height: CELL_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Inner circle for selected / today — always a proper circle
  selCircle: {
    width: SEL,
    height: SEL,
    borderRadius: SEL / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selCircleActive: {
    backgroundColor: colors.accent,
  },
  selCircleToday: {
    borderWidth: 1.5,
    borderColor: colors.accentDark,
  },
  dowText: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 4,
  },
  dayText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.textPrimary },
  dayTextSelected: { fontFamily: 'Inter_700Bold', color: '#000000' },
  dayTextToday: { fontFamily: 'Inter_700Bold', color: colors.accentDark },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accentDark,
    position: 'absolute',
    bottom: 2,
  },
  dotSelected: { backgroundColor: '#000000' },
});
