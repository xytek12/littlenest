import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HistoryListRow } from '../components/HistoryListRow';
import { HistoryBackButton } from '../navigation/HistoryBackButton';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import type { PrototypeBottleFeedEntry } from '../state/PrototypeState';
import { useAppTheme } from '../theme/useAppTheme';
import { formatDateLong, formatDayHeading, formatTimeShort } from '../utils/formatDateLong';
import { formatDurationHuman } from '../utils/formatDuration';
import { entriesInLast90Days, groupEntriesByDay } from '../utils/historyFilters';
import { colors } from '../theme/colors';

export function FeedHistoryScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const { editBottleFeedAmount, family, feedEntries } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.feed;
  const historyLabels = dictionary.feed.history;
  const commonLabels = dictionary.common;
  const rtl = isRtlLanguage(family.language);
  const rtlText = rtl ? styles.rtlText : null;
  const isTwins = family.mode === 'twins';

  const [editingBottle, setEditingBottle] = useState<PrototypeBottleFeedEntry | null>(null);
  const [editAmount, setEditAmount] = useState('');

  function handleClose() {
    const parent = navigation.getParent<any>();
    if (parent) {
      parent.navigate('Home');
    } else {
      navigation.goBack();
    }
  }

  function openBottleEdit(entry: PrototypeBottleFeedEntry) {
    setEditingBottle(entry);
    setEditAmount(String(entry.amount));
  }

  function handleSaveBottleEdit() {
    if (!editingBottle) return;
    const amount = Number.parseFloat(editAmount);
    if (!Number.isNaN(amount) && amount > 0) {
      editBottleFeedAmount({ id: editingBottle.id, amount });
    }
    setEditingBottle(null);
  }

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
                    const childName = isTwins
                      ? childById.get(entry.childId)?.displayName
                      : undefined;

                    let primary: string;
                    let detail: string;
                    let accentColor: string;
                    let onEdit: (() => void) | undefined;

                    if (entry.kind === 'bottle') {
                      const explicitDate = formatDateLong(entry.timestamp, family.language);
                      primary = `${explicitDate}  ·  ${labels.bottle}`;
                      detail = historyLabels.bottleRowAmount(entry.amount, entry.unit);
                      accentColor = colors.pink;
                      onEdit = () => openBottleEdit(entry);
                    } else {
                      // Nursing: show start → end time
                      const startTime = formatTimeShort(entry.timestamp);
                      const endMs = new Date(entry.timestamp).getTime() + entry.totalSeconds * 1000;
                      const endTime = formatTimeShort(new Date(endMs).toISOString());
                      primary = historyLabels.nursingTimeRange(startTime, endTime);
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
                        onEdit={onEdit}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Bottle edit modal */}
      <Modal
        animationType="slide"
        onRequestClose={() => setEditingBottle(null)}
        transparent
        visible={editingBottle != null}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close edit modal"
            onPress={() => setEditingBottle(null)}
            style={styles.modalBackdrop}
          />
          <View style={[styles.sheetCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sheetTitle, rtlText, { color: theme.text }]}>
              {historyLabels.editBottleTitle}
            </Text>

            <Text style={[styles.fieldLabel, rtlText, { color: theme.text }]}>
              {historyLabels.editBottleAmountLabel}
              {editingBottle ? ` (${editingBottle.unit})` : ''}
            </Text>
            <TextInput
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={theme.mutedText}
              style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
            />

            <View style={styles.actions}>
              <Pressable
                onPress={() => setEditingBottle(null)}
                style={[styles.secondaryButton, { borderColor: theme.border }]}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                  {commonLabels.cancel}
                </Text>
              </Pressable>
              <Pressable onPress={handleSaveBottleEdit} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{historyLabels.editBottleSave}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  // Bottle edit modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  sheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 18,
    paddingBottom: 32,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
    opacity: 0.7,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.blue,
    borderRadius: 14,
    flex: 1,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#0C2944',
    fontWeight: '900',
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
