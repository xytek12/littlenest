import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  GroupedHistoryCard,
  type GroupedHistoryDay,
} from '../components/GroupedHistoryCard';
import { Screen } from '../components/Screen';
import { StorybookCard } from '../components/StorybookCard';
import { TwinPickerCards } from '../components/TwinPickerCards';
import { WatercolorHeader } from '../components/WatercolorHeader';
import { getDictionary, isRtlLanguage } from '../i18n';
import type { GrowthStackParamList } from '../navigation/RootNavigator';
import {
  usePrototypeState,
  type PrototypeGrowthKind,
  type PrototypeGrowthUnitSystem,
} from '../state/PrototypeState';
import type { ChildProfile } from '../types/domain';
import { getChildAccent, getPalette } from '../theme';
import { colors } from '../theme/colors';
import { getAccentTheme } from '../theme/theme';
import { useAppTheme } from '../theme/useAppTheme';
import { formatHistoryTime } from '../utils/formatHistoryDate';
import { entriesInLastDays, groupEntriesByDay } from '../utils/historyFilters';

type LocalizedGrowthKind = {
  key: PrototypeGrowthKind;
  label: string;
  subtitle: string;
  accent: string;
};

const metricUnits: Record<PrototypeGrowthKind, string> = {
  weight: 'kg',
  height: 'cm',
  head: 'cm',
};

const imperialUnits: Record<PrototypeGrowthKind, string> = {
  weight: 'lb',
  height: 'in',
  head: 'in',
};

function accentForSex(sex: ChildProfile['sex']) {
  return getAccentTheme({ mode: 'single', sex }).primary;
}

export function GrowthScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<GrowthStackParamList>>();
  const { activeChild, family, growthEntries, saveGrowthEntry, selectChild } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.growth;
  const story = dictionary.storybook;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const isTwins = family.mode === 'twins';
  const palette = getPalette(
    isTwins
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: activeChild.sex },
  );
  const [unitSystem, setUnitSystem] = useState<PrototypeGrowthUnitSystem>('metric');
  const [selectedKind, setSelectedKind] = useState<PrototypeGrowthKind | null>(null);
  const [valueDraft, setValueDraft] = useState('');
  const units = unitSystem === 'metric' ? metricUnits : imperialUnits;
  const selectedUnit = selectedKind ? units[selectedKind] : '';
  const baseAccent = palette.primary;
  const baseKinds: LocalizedGrowthKind[] = [
    { key: 'weight', label: labels.weight, subtitle: labels.weightSubtitle, accent: baseAccent },
    { key: 'height', label: labels.height, subtitle: labels.heightSubtitle, accent: baseAccent },
  ];

  const childById = useMemo(() => {
    const map = new Map<string, ChildProfile>();
    family.children.forEach((child) => map.set(child.id, child));
    return map;
  }, [family.children]);

  const filteredGrowthEntries = useMemo(() => {
    if (!isTwins) return growthEntries;
    return growthEntries.filter((entry) => entry.childId === activeChild.id);
  }, [activeChild.id, growthEntries, isTwins]);

  const grouped = dictionary.groupedHistory;
  // Growth changes slowly — show the last 2 years (730 days) so parents can
  // scroll way back instead of being clipped to 24 hours like sleep/feed.
  const historyDays = useMemo<GroupedHistoryDay[]>(() => {
    const windowed = entriesInLastDays(
      filteredGrowthEntries,
      (entry) => entry.recordedAt,
      730,
    );
    return groupEntriesByDay(windowed, (entry) => entry.recordedAt).map((day) => ({
      dayKey: day.dayKey,
      representativeIso: day.representativeIso,
      rows: day.entries.map((entry) => {
        const time = formatHistoryTime(entry.recordedAt, family.language);
        const value = `${entry.value} ${entry.unit}`;
        const child = childById.get(entry.childId);
        const childIndex = family.children.findIndex((c) => c.id === entry.childId);
        const twinAccent = child
          ? getChildAccent(child, Math.max(0, childIndex), palette).primary
          : palette.primary;

        if (entry.kind === 'weight') {
          return {
            key: entry.id,
            primary: labels.history.weightRowInDay(time, value),
            secondary: isTwins ? child?.displayName : undefined,
            accentColor: isTwins ? twinAccent : colors.blue,
          };
        }

        if (entry.kind === 'height') {
          return {
            key: entry.id,
            primary: labels.history.heightRowInDay(time, value),
            secondary: isTwins ? child?.displayName : undefined,
            accentColor: isTwins ? twinAccent : colors.blue,
          };
        }

        return {
          key: entry.id,
          // Head row always carries the child name (unlike weight/height where
          // it's redundant for single-child families).
          primary: labels.history.headRowInDay(time, value, child?.displayName ?? ''),
          accentColor: isTwins ? twinAccent : child ? accentForSex(child.sex) : colors.pink,
        };
      }),
    }));
  }, [childById, family.children, family.language, filteredGrowthEntries, isTwins, labels.history, palette]);

  function openComposer(kind: PrototypeGrowthKind) {
    setSelectedKind(kind);
    setValueDraft('');
  }

  function saveMeasurement() {
    if (!selectedKind || !valueDraft.trim()) {
      return;
    }

    const parsedValue = Number.parseFloat(valueDraft.trim());

    if (!Number.isFinite(parsedValue)) {
      return;
    }

    saveGrowthEntry({
      kind: selectedKind,
      value: parsedValue,
      unit: units[selectedKind],
      unitSystem,
    });
    setSelectedKind(null);
    setValueDraft('');
  }

  return (
    <Screen testID="screen-growth" scroll>
      <WatercolorHeader
        title={story.growth}
        subtitle={labels.title}
        accent={palette.primary}
        accentSoft={palette.primarySoft}
      />

      <TwinPickerCards compact />

      <View style={[styles.segmentRow, { borderColor: theme.border }]}>
        {(['metric', 'imperial'] as const).map((nextSystem) => {
          const selected = unitSystem === nextSystem;

          return (
            <Pressable
              key={nextSystem}
              onPress={() => setUnitSystem(nextSystem)}
              style={[
                styles.segment,
                selected
                  ? { backgroundColor: palette.primarySoft, borderColor: palette.primary }
                  : { borderColor: theme.border },
              ]}
            >
              <Text style={[styles.segmentText, { color: selected ? palette.primaryDeep : theme.text }]}>
                {nextSystem === 'metric' ? labels.metric : labels.imperial}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {baseKinds.map((kind) => (
        <StorybookCard
          key={kind.key}
          kicker={story.kickers.growth}
          title={kind.label}
          subtitle={kind.subtitle}
          primaryAction={{
            label: story.actions.addMeasurement,
            accessibilityLabel: kind.label,
            onPress: () => openComposer(kind.key),
          }}
        />
      ))}

      {isTwins ? (
        family.children.map((child, index) => {
          const accent = getChildAccent(child, index, palette);
          return (
            <StorybookCard
              key={`head-${child.id}`}
              kicker={story.kickers.growth}
              title={`${labels.head} · ${child.displayName}`}
              subtitle={labels.headSubtitle}
              primaryAction={{
                label: story.actions.addMeasurement,
                accessibilityLabel: `${labels.head} · ${child.displayName}`,
                onPress: () => {
                  selectChild(child.id);
                  openComposer('head');
                },
              }}
            />
          );
        })
      ) : (
        <StorybookCard
          kicker={story.kickers.growth}
          title={labels.head}
          subtitle={labels.headSubtitle}
          primaryAction={{
            label: story.actions.addMeasurement,
            accessibilityLabel: labels.head,
            onPress: () => openComposer('head'),
          }}
        />
      )}

      {selectedKind ? (
        <View style={[styles.composer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.composerTitle, rtlText, { color: theme.text }]}>
            {labels.entryTitle(
              selectedKind === 'weight'
                ? labels.weight
                : selectedKind === 'height'
                  ? labels.height
                  : labels.head,
              selectedUnit,
            )}
          </Text>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={setValueDraft}
            placeholder={labels.placeholder}
            placeholderTextColor={theme.mutedText}
            style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
            value={valueDraft}
          />
          <Pressable onPress={saveMeasurement} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{labels.save}</Text>
          </Pressable>
        </View>
      ) : null}

      <GroupedHistoryCard
        days={historyDays}
        windowLabel={grouped.last2Years}
        emptyLabel={grouped.emptyYears}
        onPress={() => navigation.navigate('GrowthHistory')}
        testID="growth-inline-history"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900', marginBottom: 16 },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  segmentText: {
    fontWeight: '900',
  },
  composer: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  composerTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.blue,
    borderRadius: 14,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#0C2944',
    fontWeight: '900',
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
