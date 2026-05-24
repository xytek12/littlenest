import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HistoryListRow } from '../components/HistoryListRow';
import { Screen } from '../components/Screen';
import { HistoryBackButton } from '../navigation/HistoryBackButton';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState, type PrototypeGrowthEntry } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import { formatHistoryDate, formatHistoryTime } from '../utils/formatHistoryDate';
import { entriesInLast90Days } from '../utils/historyFilters';

function accentForSex(sex: 'boy' | 'girl'): string {
  return sex === 'boy' ? colors.blue : colors.pink;
}

export function GrowthHistoryScreen() {
  const theme = useAppTheme();
  const { family, growthEntries } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.growth.history;
  const rtl = isRtlLanguage(family.language);

  const childById = useMemo(() => {
    const map = new Map<string, (typeof family.children)[number]>();
    family.children.forEach((child) => map.set(child.id, child));
    return map;
  }, [family.children]);

  const recent = useMemo(
    () => entriesInLast90Days(growthEntries, (entry) => entry.recordedAt),
    [growthEntries],
  );

  function renderRow(entry: PrototypeGrowthEntry) {
    const date = formatHistoryDate(entry.recordedAt, family.language);
    const time = formatHistoryTime(entry.recordedAt, family.language);
    const value = `${entry.value} ${entry.unit}`;

    if (entry.kind === 'weight') {
      return (
        <HistoryListRow
          key={entry.id}
          primary={labels.weightRow(date, time, value)}
          accentColor={colors.blue}
          rtl={rtl}
        />
      );
    }

    if (entry.kind === 'height') {
      return (
        <HistoryListRow
          key={entry.id}
          primary={labels.heightRow(date, time, value)}
          accentColor={colors.blue}
          rtl={rtl}
        />
      );
    }

    const child = childById.get(entry.childId);
    const childName = child?.displayName ?? '';
    const accent = child ? accentForSex(child.sex) : colors.pink;

    return (
      <HistoryListRow
        key={entry.id}
        primary={labels.headRow(date, time, value, childName)}
        accentColor={accent}
        rtl={rtl}
      />
    );
  }

  return (
    <Screen testID="screen-growth-history" scroll>
      <HistoryBackButton />
      <Text
        style={[
          styles.title,
          rtl ? styles.rtlText : null,
          { color: theme.text },
        ]}
      >
        {labels.title}
      </Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {recent.length > 0 ? (
          recent.map(renderRow)
        ) : (
          <Text style={[styles.empty, rtl ? styles.rtlText : null]}>
            {dictionary.history.emptyAll}
          </Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  empty: {
    color: '#6B7D91',
    lineHeight: 20,
    paddingVertical: 12,
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
