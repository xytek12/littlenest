import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HistoryListRow } from '../components/HistoryListRow';
import { HistoryBackButton } from '../navigation/HistoryBackButton';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import type { PrototypeSleepSession } from '../state/PrototypeState';
import { useAppTheme } from '../theme/useAppTheme';
import { colors } from '../theme/colors';
import { formatDurationHuman } from '../utils/formatDuration';
import { formatDayHeading, formatTimeShort } from '../utils/formatDateLong';
import { formatHistoryTime } from '../utils/formatHistoryDate';
import { entriesInLast90Days, groupEntriesByDay } from '../utils/historyFilters';

function toHHMM(isoString: string): string {
  const date = new Date(isoString);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function applyTimeToDate(baseIso: string, hhmm: string): string {
  const [hhStr, mmStr] = hhmm.split(':');
  const hh = Number.parseInt(hhStr ?? '', 10);
  const mm = Number.parseInt(mmStr ?? '', 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return baseIso;
  const date = new Date(baseIso);
  date.setHours(hh, mm, 0, 0);
  return date.toISOString();
}

export function SleepHistoryScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const { editSleepSession, family, sleepSessions } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.sleep;
  const historyLabels = labels.history;
  const commonLabels = dictionary.common;
  const rtl = isRtlLanguage(family.language);
  const rtlText = rtl ? styles.rtlText : null;
  const isTwins = family.mode === 'twins';

  const [editingSession, setEditingSession] = useState<PrototypeSleepSession | null>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editWakes, setEditWakes] = useState('');

  const childById = useMemo(() => {
    const map = new Map<string, (typeof family.children)[number]>();
    family.children.forEach((child) => map.set(child.id, child));
    return map;
  }, [family.children]);

  const recent = useMemo(
    () => entriesInLast90Days(sleepSessions, (session) => session.startedAt),
    [sleepSessions],
  );

  const dayGroups = useMemo(
    () => groupEntriesByDay(recent, (session) => session.startedAt),
    [recent],
  );

  function handleClose() {
    // When rendered inside the tab+stack navigator (real app), navigate the
    // parent tab navigator to Home. In tests (plain stack, no tab parent),
    // fall back to a regular goBack().
    const parent = navigation.getParent<any>();
    if (parent) {
      parent.navigate('Home');
    } else {
      navigation.goBack();
    }
  }

  function openEdit(session: PrototypeSleepSession) {
    setEditingSession(session);
    setEditStart(toHHMM(session.startedAt));
    setEditEnd(toHHMM(session.endedAt));
    setEditWakes(String(session.wakeCount));
  }

  function handleSaveEdit() {
    if (!editingSession) return;

    let newStartedAt = applyTimeToDate(editingSession.startedAt, editStart);
    let newEndedAt = applyTimeToDate(editingSession.startedAt, editEnd);

    // If end is earlier than start, assume it crossed midnight
    if (new Date(newEndedAt) <= new Date(newStartedAt)) {
      const endDate = new Date(newEndedAt);
      endDate.setDate(endDate.getDate() + 1);
      newEndedAt = endDate.toISOString();
    }

    editSleepSession({
      id: editingSession.id,
      startedAt: newStartedAt,
      endedAt: newEndedAt,
      wakeCount: Number.parseInt(editWakes, 10) || 0,
    });
    setEditingSession(null);
  }

  return (
    <SafeAreaView
      testID="screen-sleep-history"
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}
        style={{ backgroundColor: theme.background }}
      >
        <HistoryBackButton onPress={handleClose} />
        <Text style={[styles.title, rtlText, { color: theme.text }]}>
          {dictionary.homeSleep.sleepHistoryTitle}
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
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {day.entries.map((session) => {
                    const time = formatHistoryTime(session.startedAt, family.language);
                    const duration = formatDurationHuman(session.durationSeconds, family.language);
                    const childName = isTwins
                      ? childById.get(session.childId)?.displayName
                      : undefined;
                    const wakesLine = historyLabels.rowWakes(session.wakeCount);
                    const secondary = childName ? `${wakesLine}  ·  ${childName}` : wakesLine;

                    return (
                      <HistoryListRow
                        key={session.id}
                        primary={historyLabels.rowInDay(time, duration, session.wakeCount)}
                        secondary={secondary}
                        rtl={rtl}
                        onEdit={() => openEdit(session)}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Edit modal — kept from the original design */}
      <Modal
        animationType="slide"
        onRequestClose={() => setEditingSession(null)}
        transparent
        visible={editingSession != null}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close edit modal"
            onPress={() => setEditingSession(null)}
            style={styles.modalBackdrop}
          />
          <View style={[styles.sheetCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sheetTitle, rtlText, { color: theme.text }]}>
              {labels.editTitle}
            </Text>

            <Text style={[styles.fieldLabel, rtlText, { color: theme.text }]}>
              {labels.editStartLabel}
            </Text>
            <TextInput
              value={editStart}
              onChangeText={setEditStart}
              keyboardType="numbers-and-punctuation"
              placeholder="07:30"
              placeholderTextColor={theme.mutedText}
              style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
            />

            <Text style={[styles.fieldLabel, rtlText, { color: theme.text }]}>
              {labels.editEndLabel}
            </Text>
            <TextInput
              value={editEnd}
              onChangeText={setEditEnd}
              keyboardType="numbers-and-punctuation"
              placeholder="09:15"
              placeholderTextColor={theme.mutedText}
              style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
            />

            <Text style={[styles.fieldLabel, rtlText, { color: theme.text }]}>
              {labels.editWakesLabel}
            </Text>
            <TextInput
              value={editWakes}
              onChangeText={setEditWakes}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={theme.mutedText}
              style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
            />

            <View style={styles.actions}>
              <Pressable
                onPress={() => setEditingSession(null)}
                style={[styles.secondaryButton, { borderColor: theme.border }]}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                  {commonLabels.cancel}
                </Text>
              </Pressable>
              <Pressable onPress={handleSaveEdit} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{labels.editSave}</Text>
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
  // Edit modal
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
