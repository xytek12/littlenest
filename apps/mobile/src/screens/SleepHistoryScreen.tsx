import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { HistoryListRow } from '../components/HistoryListRow';
import { Screen } from '../components/Screen';
import { HistoryBackButton } from '../navigation/HistoryBackButton';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import type { PrototypeSleepSession } from '../state/PrototypeState';
import { useAppTheme } from '../theme/useAppTheme';
import { colors } from '../theme/colors';
import { formatDurationSeconds, formatDurationHuman } from '../utils/formatDuration';
import { formatHistoryDate, formatHistoryTime } from '../utils/formatHistoryDate';
import { entriesInLast90Days } from '../utils/historyFilters';

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
    <Screen testID="screen-sleep-history" scroll>
      <HistoryBackButton />
      <Text style={[styles.title, rtlText, { color: theme.text }]}>
        {historyLabels.title}
      </Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {recent.length > 0 ? (
          recent.map((session) => {
            const date = formatHistoryDate(session.startedAt, family.language);
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
                primary={historyLabels.rowPrimary(date, time, duration)}
                secondary={secondary}
                rtl={rtl}
                onEdit={() => openEdit(session)}
              />
            );
          })
        ) : (
          <Text style={[styles.empty, rtlText]}>
            {dictionary.history.emptyAll}
          </Text>
        )}
      </View>

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
              placeholderTextColor="#8B99AA"
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
              placeholderTextColor="#8B99AA"
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
              placeholderTextColor="#8B99AA"
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
