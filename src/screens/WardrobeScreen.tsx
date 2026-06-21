import React, { useState, useCallback } from 'react';
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

type Filter = 'all' | ExerciseType;

export default function WardrobeScreen() {
  const nav = useNavigation();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [lang, setLang] = useState<Language>('es');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Outfit | null>(null);

  useFocusEffect(
    useCallback(() => {
      getLanguage().then(setLang);
      getOutfits().then(setOutfits);
    }, []),
  );

  const filtered = filter === 'all' ? outfits : outfits.filter(o => o.exerciseType === filter);

  const filterOptions = [
    { key: 'all' as Filter, label: t('wardrobeAll', lang) as string },
    { key: 'running' as Filter, label: 'Running' },
    { key: 'gym' as Filter, label: 'Gym' },
    { key: 'cycling' as Filter, label: lang === 'es' ? 'Ciclismo' : 'Cycling' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('wardrobeTitle', lang)}</Text>
        <Text style={styles.count}>{(t('wardrobeOutfits', lang) as (n: number) => string)(filtered.length)}</Text>
      </View>

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

      {outfits.length === 0 ? (
        <View style={styles.empty}>
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
        </View>
      ) : (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH }}>
              <OutfitCard outfit={item} onPress={() => setSelected(item)} />
            </View>
          )}
        />
      )}

      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet">
        {selected && (
          <View style={styles.modal}>
            <Image source={{ uri: selected.imageUri }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.88)']} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.modalSafe}>
              <TouchableOpacity onPress={() => setSelected(null)} style={styles.modalClose}>
                <Ionicons name="close" size={18} color="#FFF" />
              </TouchableOpacity>
              <ScrollView contentContainerStyle={styles.modalContent}>
                <Text style={styles.modalScore}>{selected.score.total}<Text style={styles.modalScoreOf}>/10</Text></Text>
                <Text style={styles.modalBasis}>{selected.score.basis}</Text>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { fontFamily: 'Inter_700Bold', fontSize: 34, color: colors.textPrimary },
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
  chipTextActive: { color: '#FFFFFF' },
  grid: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  row: { gap: spacing.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 22, color: colors.textPrimary, textAlign: 'center' },
  emptySub: { fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    backgroundColor: colors.accentBlue,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
  },
  emptyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF' },
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
});
