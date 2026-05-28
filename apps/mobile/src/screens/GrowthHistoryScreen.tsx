import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HistoryListRow } from '../components/HistoryListRow';
import { HistoryBackButton } from '../navigation/HistoryBackButton';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { getChildAccent, getPalette } from '../theme';
import { useAppTheme } from '../theme/useAppTheme';
import { formatDayHeading } from '../utils/formatDateLong';
import { entriesInLast90Days, groupEntriesByDay } from '../utils/historyFilters';

export function GrowthHistoryScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const { family, growthEntries } = usePrototypeState();

  function handleClose() {
    const parent = navigation.getParent<any>();
    if (parent) {
      parent.navigate('Home');
    } else {
      navigation.goBack();
    }
  }
  const dictionary = getDictionary(family.language);
  const labels = dictionary.growth;
  const historyLabels = labels.history;
  const rtl = isRtlLanguage(family.language);
  const rtlText = rtl ? styles.rtlText : null;
  const isTwins = family.mode === 'twins';

  const palette = getPalette(
    isTwins
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: family.children[0]?.sex ?? 'girl' },
  );

  const childById = useMemo(() => {
    const map = new Map<string, (typeof family.children)[number]>();
    family.children.forEach((child) => map.set(child.id, child));
    return map;
  }, [family.children]);

  const recent = useMemo(
    () => entriesInLast90Days(growthEntries, (entry) => entry.recordedAt),
    [growthEntries],
  );

  const dayGroups = useMemo(
    () => groupEntriesByDay(recent, (entry) => entry.recordedAt),
    [recent],
  );

  function kindLabel(kind: 'weight' | 'height' | 'head'): string {
    return kind === 'weight'
      ? labels.weight
      : kind === 'height'
        ? labels.height
        : labels.head;
  }

  function accentForEntry(childId: string, kind: 'weight' | 'height' | 'head'): string {
    const child = childById.get(childId);
    if (!child) return colors.blue;
    if (kind === 'head') {
      const idx = family.children.findIndex((c) => c.id === childId);
      return getChildAccent(child, Math.max(0, idx), palette).primary;
    }
    return colors.blue;
  }

  return (
    <SafeAreaView
      testID="screen-growth-history"
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}
        style={{ backgroundColor: theme.background }}
      >
        <HistoryBackButton onPress={handleClose} />
        <Text style={[styles.title, rtlText, { color: theme.text }]}>
          {historyLabels.title}
        </Text>

        {dayGroups.length === 0 ? (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.empty, rtlText, { color: theme.mutedText }]}>
              {dictionary.history.emptyAll}
            </Text>
          </View>
        ) : (
          dayGroups.map((day) => {
            const dayHeading = formatDayHeading(day.representativeIso, family.language);
            return (
              <View key={day.dayKey} style={styles.dayBlock}>
                <Text style={[styles.dayHeading, rtlText, { color: theme.mutedText }]}>
                  {dayHeading}
                </Text>
                <View
                  style={[
                    styles.card,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  {day.entries.map((entry) => {
                    const label = kindLabel(entry.kind);
                    // "Weight: 8.2 kg" / "משקל: 8.2 ק"ג"
                    const primary = historyLabels.inDayRow(label, entry.value, entry.unit);
                    const child = isTwins ? childById.get(entry.childId) : undefined;
                    const accent = accentForEntry(entry.childId, entry.kind);

                    return (
                      <HistoryListRow
                        key={entry.id}
                        primary={primary}
                        secondary={child?.displayName}
                        accentColor={accent}
                        rtl={rtl}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
  },
  dayBlock: {
    marginBottom: 20,
  },
  dayHeading: {
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  empty: {
    lineHeight: 20,
    paddingVertical: 12,
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
