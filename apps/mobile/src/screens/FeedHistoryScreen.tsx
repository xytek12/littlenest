import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HistoryListRow } from '../components/HistoryListRow';
import { HistoryBackButton } from '../navigation/HistoryBackButton';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { useAppTheme } from '../theme/useAppTheme';
import { formatDateLong, formatDayHeading } from '../utils/formatDateLong';
import { formatDurationHuman } from '../utils/formatDuration';
import { entriesInLast90Days, groupEntriesByDay } from '../utils/historyFilters';
import { colors } from '../theme/colors';

export function FeedHistoryScreen() {
  const theme = useAppTheme();
  const { family, feedEntries } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.feed;
  const historyLabels = dictionary.feed.history;
  const rtl = isRtlLanguage(family.language);
  const rtlText = rtl ? styles.rtlText : null;
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

  // Group by calendar day — newest day first
  const dayGroups = useMemo(
    () => groupEntriesByDay(recent, (entry) => entry.timestamp),
    [recent],
  );

  return (
    <SafeAreaView
      testID="screen-feed-history"
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}
        style={{ backgroundColor: theme.background }}
      >
        <HistoryBackButton />
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
                {/* Italic-serif day heading */}
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
                    // Explicit date prefix: "Wed · May 27 · 19:14"
                    const explicitDate = formatDateLong(entry.timestamp, family.language);
                    const childName = isTwins
                      ? childById.get(entry.childId)?.displayName
                      : undefined;

                    let primary: string;
                    let detail: string;
                    let accentColor: string;

                    if (entry.kind === 'bottle') {
                      // primary: "Wed · May 27 · 19:14  ·  Bottle"
                      primary = `${explicitDate}  ·  ${labels.bottle}`;
                      detail = historyLabels.bottleRowAmount(entry.amount, entry.unit);
                      accentColor = colors.pink;
                    } else {
                      // primary: "Wed · May 27 · 19:14  ·  Nursing"
                      primary = `${explicitDate}  ·  ${labels.nursing}`;
                      detail = historyLabels.nursingRowSides(
                        formatDurationHuman(entry.leftSeconds, family.language),
                        formatDurationHuman(entry.rightSeconds, family.language),
                      );
                      accentColor = colors.sage;
                    }

                    const secondary = childName ? `${detail}  ·  ${childName}` : detail;

                    return (
                      <HistoryListRow
                        key={entry.id}
                        primary={primary}
                        secondary={secondary}
                        accentColor={accentColor}
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
