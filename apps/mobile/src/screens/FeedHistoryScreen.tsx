import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HistoryListRow } from '../components/HistoryListRow';
import { Screen } from '../components/Screen';
import { HistoryBackButton } from '../navigation/HistoryBackButton';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { useAppTheme } from '../theme/useAppTheme';
import { formatDurationSeconds } from '../utils/formatDuration';
import { formatHistoryDate, formatHistoryTime } from '../utils/formatHistoryDate';
import { entriesInLast90Days } from '../utils/historyFilters';

export function FeedHistoryScreen() {
  const theme = useAppTheme();
  const { family, feedEntries } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.feed.history;
  const rtl = isRtlLanguage(family.language);
  const isTwins = family.mode === 'twins';

  const childById = useMemo(() => {
    const map = new Map<string, (typeof family.children)[number]>();
    family.children.forEach((child) => map.set(child.id, child));
    return map;
  }, [family.children]);

  const recent = useMemo(
    () => entriesInLast90Days(feedEntries, (entry) => entry.timestamp),
    [feedEntries],
  );

  return (
    <Screen testID="screen-feed-history" scroll>
      <HistoryBackButton />
      <Text
        style={[styles.title, rtl ? styles.rtlText : null, { color: theme.text }]}
      >
        {labels.title}
      </Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {recent.length > 0 ? (
          recent.map((entry) => {
            const date = formatHistoryDate(entry.timestamp, family.language);
            const time = formatHistoryTime(entry.timestamp, family.language);
            const childName = isTwins
              ? childById.get(entry.childId)?.displayName
              : undefined;

            const primary =
              entry.kind === 'bottle'
                ? labels.bottleRow(date, time, entry.amount, entry.unit)
                : labels.nursingRow(
                    date,
                    time,
                    formatDurationSeconds(entry.totalSeconds),
                    formatDurationSeconds(entry.leftSeconds),
                    formatDurationSeconds(entry.rightSeconds),
                  );

            return (
              <HistoryListRow
                key={entry.id}
                primary={primary}
                secondary={childName}
                rtl={rtl}
              />
            );
          })
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
