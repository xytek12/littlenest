import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

type GrowthKind = 'Weight' | 'Height' | 'Head circumference';
type UnitSystem = 'metric' | 'imperial';

type GrowthEntry = {
  id: string;
  kind: GrowthKind;
  value: string;
  unit: string;
};

const metricUnits: Record<GrowthKind, string> = {
  Weight: 'kg',
  Height: 'cm',
  'Head circumference': 'cm',
};

const imperialUnits: Record<GrowthKind, string> = {
  Weight: 'lb',
  Height: 'in',
  'Head circumference': 'in',
};

export function GrowthScreen() {
  const theme = useAppTheme();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [selectedKind, setSelectedKind] = useState<GrowthKind | null>(null);
  const [valueDraft, setValueDraft] = useState('');
  const [entries, setEntries] = useState<GrowthEntry[]>([]);
  const units = unitSystem === 'metric' ? metricUnits : imperialUnits;
  const selectedUnit = selectedKind ? units[selectedKind] : '';
  const summary = useMemo(
    () => entries.map((entry) => `${entry.kind} ${entry.value} ${entry.unit}`),
    [entries],
  );

  function openComposer(kind: GrowthKind) {
    setSelectedKind(kind);
    setValueDraft('');
  }

  function saveMeasurement() {
    if (!selectedKind || !valueDraft.trim()) {
      return;
    }

    setEntries((current) => [
      {
        id: `${selectedKind}-${Date.now()}`,
        kind: selectedKind,
        value: valueDraft.trim(),
        unit: units[selectedKind],
      },
      ...current,
    ]);
    setSelectedKind(null);
    setValueDraft('');
  }

  return (
    <Screen testID="screen-growth" scroll>
      <Text style={[styles.title, { color: theme.text }]}>Growth</Text>

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
                {nextSystem === 'metric' ? 'Metric' : 'Imperial'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ActionCard
        title="Weight"
        subtitle={`Add a new weight entry in ${units.Weight}.`}
        accent={colors.blue}
        onPress={() => openComposer('Weight')}
      />
      <ActionCard
        title="Height"
        subtitle={`Track height changes in ${units.Height}.`}
        accent={colors.blue}
        onPress={() => openComposer('Height')}
      />
      <ActionCard
        title="Head circumference"
        subtitle={`Track head growth in ${units['Head circumference']}.`}
        accent={colors.pink}
        onPress={() => openComposer('Head circumference')}
      />

      {selectedKind ? (
        <View style={[styles.composer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.composerTitle, { color: theme.text }]}>
            {selectedKind} ({selectedUnit})
          </Text>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={setValueDraft}
            placeholder="0"
            placeholderTextColor="#8B99AA"
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={valueDraft}
          />
          <Pressable onPress={saveMeasurement} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Save measurement</Text>
          </Pressable>
        </View>
      ) : null}

      {summary.length > 0 ? (
        <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.summaryTitle, { color: theme.text }]}>Latest growth entries</Text>
          {summary.map((line) => (
            <Text key={line} style={styles.summaryLine}>
              {line}
            </Text>
          ))}
        </View>
      ) : null}
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
  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  summaryLine: {
    color: '#6B7D91',
    lineHeight: 20,
    marginTop: 4,
  },
});
