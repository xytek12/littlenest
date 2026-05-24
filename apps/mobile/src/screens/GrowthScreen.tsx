import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { InlineHistoryCard, type InlineHistoryRow } from '../components/InlineHistoryCard';
import { Screen } from '../components/Screen';
import { getDictionary, isRtlLanguage } from '../i18n';
import type { GrowthStackParamList } from '../navigation/RootNavigator';
import {
  usePrototypeState,
  type PrototypeGrowthKind,
  type PrototypeGrowthUnitSystem,
} from '../state/PrototypeState';
import type { ChildProfile } from '../types/domain';
import { colors } from '../theme/colors';
import { getAccentTheme } from '../theme/theme';
import { useAppTheme } from '../theme/useAppTheme';
import { formatHistoryDate, formatHistoryTime } from '../utils/formatHistoryDate';
import { entriesInLast24h } from '../utils/historyFilters';

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
  const { family, growthEntries, saveGrowthEntry } = usePrototypeState();
  const labels = getDictionary(family.language).growth;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const [unitSystem, setUnitSystem] = useState<PrototypeGrowthUnitSystem>('metric');
  const [selectedKind, setSelectedKind] = useState<PrototypeGrowthKind | null>(null);
  const [valueDraft, setValueDraft] = useState('');
  const units = unitSystem === 'metric' ? metricUnits : imperialUnits;
  const selectedUnit = selectedKind ? units[selectedKind] : '';
  const baseKinds: LocalizedGrowthKind[] = [
    { key: 'weight', label: labels.weight, subtitle: labels.weightSubtitle, accent: colors.blue },
    { key: 'height', label: labels.height, subtitle: labels.heightSubtitle, accent: colors.blue },
  ];

  const childById = useMemo(() => {
    const map = new Map<string, ChildProfile>();
    family.children.forEach((child) => map.set(child.id, child));
    return map;
  }, [family.children]);

  const inlineRows = useMemo<InlineHistoryRow[]>(() => {
    return entriesInLast24h(growthEntries, (entry) => entry.recordedAt)
      .slice(0, 5)
      .map((entry) => {
        const date = formatHistoryDate(entry.recordedAt, family.language);
        const time = formatHistoryTime(entry.recordedAt, family.language);
        const value = `${entry.value} ${entry.unit}`;

        if (entry.kind === 'weight') {
          return {
            key: entry.id,
            primary: labels.history.weightRow(date, time, value),
            accentColor: colors.blue,
          };
        }

        if (entry.kind === 'height') {
          return {
            key: entry.id,
            primary: labels.history.heightRow(date, time, value),
            accentColor: colors.blue,
          };
        }

        const child = childById.get(entry.childId);
        return {
          key: entry.id,
          primary: labels.history.headRow(date, time, value, child?.displayName ?? ''),
          accentColor: child ? accentForSex(child.sex) : colors.pink,
        };
      });
  }, [childById, family.language, growthEntries, labels.history]);

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
      <Text style={[styles.title, rtlText, { color: theme.text }]}>{labels.title}</Text>

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
                  ? { backgroundColor: colors.blueSoft, borderColor: colors.blue }
                  : { borderColor: theme.border },
              ]}
            >
              <Text style={[styles.segmentText, { color: selected ? '#284D71' : theme.text }]}>
                {nextSystem === 'metric' ? labels.metric : labels.imperial}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {baseKinds.map((kind) => (
        <ActionCard
          key={kind.key}
          title={kind.label}
          subtitle={kind.subtitle}
          accent={kind.accent}
          onPress={() => openComposer(kind.key)}
        />
      ))}

      {family.mode === 'twins' ? (
        family.children.map((child) => (
          <ActionCard
            key={`head-${child.id}`}
            title={`${labels.head} · ${child.displayName}`}
            subtitle={labels.headSubtitle}
            accent={accentForSex(child.sex)}
            onPress={() => openComposer('head')}
          />
        ))
      ) : (
        <ActionCard
          title={labels.head}
          subtitle={labels.headSubtitle}
          accent={accentForSex(family.children[0]?.sex ?? 'girl')}
          onPress={() => openComposer('head')}
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
            placeholderTextColor="#8B99AA"
            style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
            value={valueDraft}
          />
          <Pressable onPress={saveMeasurement} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{labels.save}</Text>
          </Pressable>
        </View>
      ) : null}

      <InlineHistoryCard
        rows={inlineRows}
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
