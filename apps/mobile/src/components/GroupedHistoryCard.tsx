import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { useAppTheme } from '../theme/useAppTheme';
import { formatHistoryDate } from '../utils/formatHistoryDate';

export type GroupedHistoryRow = {
  key: string;
  primary: string;
  secondary?: string;
  accentColor?: string;
};

export type GroupedHistoryDay = {
  dayKey: string;
  representativeIso: string;
  rows: GroupedHistoryRow[];
};

type Props = {
  /** Each entry is a day group, already sorted newest-first. */
  days: GroupedHistoryDay[];
  /** Window label shown at the top, e.g. "Last 7 days" / "Last 2 years". */
  windowLabel: string;
  /** Empty-state copy when no entries fall in the window. */
  emptyLabel: string;
  /** "View all →" tap target. */
  onPress: () => void;
  testID?: string;
};

/**
 * Date-grouped, expandable history card.
 *
 * Each day row collapses to a one-line summary "<date> · N entries" and
 * expands inline when tapped to reveal every entry recorded on that day.
 * The most recent day is expanded by default so the most-likely-needed
 * detail is one tap less away.
 *
 * Tapping the card's "view all" header still pushes the full history screen
 * via `onPress`.
 */
export function GroupedHistoryCard({
  days,
  windowLabel,
  emptyLabel,
  onPress,
  testID,
}: Props) {
  const theme = useAppTheme();
  const { family } = usePrototypeState();
  const history = getDictionary(family.language).history;
  const grouped = getDictionary(family.language).groupedHistory;
  const rtl = isRtlLanguage(family.language);
  const rtlText = rtl ? styles.rtlText : null;

  const [expanded, setExpanded] = useState<Set<string>>(() =>
    days.length > 0 ? new Set([days[0].dayKey]) : new Set<string>(),
  );

  // Whenever the newest day changes (entries get added/removed), auto-expand
  // it. Older days the user has manually collapsed stay collapsed.
  const newestKey = days[0]?.dayKey;
  useEffect(() => {
    if (!newestKey) return;
    setExpanded((current) => {
      if (current.has(newestKey)) return current;
      const next = new Set(current);
      next.add(newestKey);
      return next;
    });
  }, [newestKey]);

  function toggleDay(key: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const hasDays = days.length > 0;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
      testID={testID}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={windowLabel}
        onPress={onPress}
        style={styles.header}
      >
        <Text style={[styles.title, rtlText, { color: theme.text }]}>{windowLabel}</Text>
        <Text style={[styles.viewAll, { color: theme.text }]}>{history.viewAll} →</Text>
      </Pressable>

      {hasDays ? (
        days.map((day) => {
          const open = expanded.has(day.dayKey);
          const dateLabel = formatHistoryDate(day.representativeIso, family.language);
          const countLabel = grouped.entriesCount(day.rows.length);

          return (
            <View key={day.dayKey} style={styles.dayBlock}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                onPress={() => toggleDay(day.dayKey)}
                style={[styles.dayHeader, { borderColor: theme.border }]}
              >
                <Text style={[styles.dayCaret, { color: theme.mutedText }]}>
                  {open ? '▾' : rtl ? '◂' : '▸'}
                </Text>
                <View style={styles.dayHeaderBody}>
                  <Text style={[styles.dayDate, rtlText, { color: theme.text }]}>{dateLabel}</Text>
                  <Text style={[styles.dayCount, rtlText, { color: theme.mutedText }]}>
                    {countLabel}
                  </Text>
                </View>
              </Pressable>

              {open
                ? day.rows.map((row) => (
                    <View key={row.key} style={styles.row}>
                      <View
                        style={[
                          styles.marker,
                          { backgroundColor: row.accentColor ?? theme.border },
                        ]}
                      />
                      <View style={styles.rowBody}>
                        <Text style={[styles.rowPrimary, rtlText, { color: theme.text }]}>
                          {row.primary}
                        </Text>
                        {row.secondary ? (
                          <Text
                            style={[styles.rowSecondary, rtlText, { color: theme.mutedText }]}
                          >
                            {row.secondary}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  ))
                : null}
            </View>
          );
        })
      ) : (
        <Text style={[styles.empty, rtlText, { color: theme.mutedText }]}>{emptyLabel}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '800',
    opacity: 0.7,
  },
  dayBlock: {
    marginTop: 8,
  },
  dayHeader: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dayCaret: {
    fontSize: 14,
    fontWeight: '900',
    width: 14,
  },
  dayHeaderBody: {
    flex: 1,
  },
  dayDate: {
    fontSize: 14,
    fontWeight: '900',
  },
  dayCount: {
    fontSize: 12,
    marginTop: 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  marker: {
    alignSelf: 'stretch',
    borderRadius: 6,
    width: 5,
  },
  rowBody: { flex: 1 },
  rowPrimary: {
    fontWeight: '700',
    lineHeight: 20,
  },
  rowSecondary: {
    lineHeight: 18,
    marginTop: 2,
  },
  empty: {
    lineHeight: 20,
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
