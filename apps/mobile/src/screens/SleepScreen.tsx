import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FlowHeader } from '../components/FlowHeader';
import {
  GroupedHistoryCard,
  type GroupedHistoryDay,
} from '../components/GroupedHistoryCard';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { TwinPickerCards } from '../components/TwinPickerCards';
import { getDictionary, isRtlLanguage } from '../i18n';
import type { SleepStackParamList } from '../navigation/RootNavigator';
import { usePrototypeState } from '../state/PrototypeState';
import { getChildAccent, getPalette } from '../theme';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import { formatDurationHuman } from '../utils/formatDuration';
import { formatDateLong } from '../utils/formatDateLong';
import { formatHistoryTime } from '../utils/formatHistoryDate';
import { entriesInLastDays, groupEntriesByDay } from '../utils/historyFilters';
import { useTickEverySecond } from '../utils/useTickEverySecond';

function getRunningDuration(startedAt: string, language = 'he') {
  return formatDurationHuman(
    Math.max(0, Math.round((Date.now() - Date.parse(startedAt)) / 1000)),
    language,
  );
}


export function SleepScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<SleepStackParamList>>();
  const {
    activeChild,
    activeSleepStartedAt,
    endSleep,
    family,
    sleepSessions,
    startSleep,
  } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.sleep;
  const commonLabels = dictionary.common;
  const homeSleep = dictionary.homeSleep;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const isTwins = family.mode === 'twins';
  const palette = getPalette(
    isTwins
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: activeChild.sex },
  );
  const activeIndex = family.children.findIndex((child) => child.id === activeChild.id);
  const activeAccent = getChildAccent(activeChild, Math.max(0, activeIndex), palette);
  const [wakeCountDraft, setWakeCountDraft] = useState('0');
  const [showTimerSheet, setShowTimerSheet] = useState(false);
  const [showWakePrompt, setShowWakePrompt] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const isSleepActive = activeSleepStartedAt != null && !timerPaused;
  useTickEverySecond(isSleepActive);
  const childById = useMemo(() => {
    const map = new Map<string, (typeof family.children)[number]>();
    family.children.forEach((child) => map.set(child.id, child));
    return map;
  }, [family.children]);
  const filteredSessions = useMemo(() => {
    if (!isTwins) return sleepSessions;
    return sleepSessions.filter((session) => session.childId === activeChild.id);
  }, [activeChild.id, isTwins, sleepSessions]);

  const grouped = dictionary.groupedHistory;
  const historyDays = useMemo<GroupedHistoryDay[]>(() => {
    const windowed = entriesInLastDays(
      filteredSessions,
      (session) => session.startedAt,
      7,
    );
    return groupEntriesByDay(windowed, (session) => session.startedAt).map((day) => ({
      dayKey: day.dayKey,
      representativeIso: day.representativeIso,
      rows: day.entries.map((session) => {
        const child = childById.get(session.childId);
        const childIndex = family.children.findIndex((c) => c.id === session.childId);
        const accent = child
          ? getChildAccent(child, Math.max(0, childIndex), palette)
          : { primary: palette.primary };
        return {
          key: session.id,
          primary: labels.history.rowInDay(
            formatHistoryTime(session.startedAt, family.language),
            formatDurationHuman(session.durationSeconds, family.language),
            session.wakeCount,
          ),
          secondary: isTwins ? child?.displayName : undefined,
          accentColor: isTwins ? accent.primary : colors.blue,
        };
      }),
    }));
  }, [childById, family.children, family.language, filteredSessions, isTwins, labels.history, palette]);
  const canEnd = Boolean(activeSleepStartedAt);

  function handleStartSleep() {
    startSleep();
    setShowTimerSheet(true);
    setShowWakePrompt(false);
    setTimerPaused(false);
    setWakeCountDraft('0');
  }

  function handleEndSleep() {
    if (!canEnd) {
      return;
    }

    setShowWakePrompt(true);
    setShowTimerSheet(true);
  }

  function handleSaveSleep() {
    endSleep({ wakeCount: Number.parseInt(wakeCountDraft, 10) || 0 });
    setShowTimerSheet(false);
    setShowWakePrompt(false);
    setTimerPaused(false);
    setWakeCountDraft('0');
  }

  // Active sleep card body — human-readable duration (for test matching) + Stop button
  const activeSleepBody = activeSleepStartedAt ? (
    <View style={styles.activeSleepBody}>
      <View style={styles.activeSleepLeft}>
        <Text style={[styles.activeSleepLabel, { color: theme.mutedText }]}>
          {homeSleep.activeSleepLabel}
        </Text>
        {/* Human-readable duration — text matches what tests query for (e.g. "5 seconds") */}
        <Text style={[styles.activeSleepTimer, { color: theme.text }]}>
          {getRunningDuration(activeSleepStartedAt, family.language)}
        </Text>
        <Text style={[styles.activeSleepSince, { color: theme.mutedText }]}>
          {homeSleep.activeSleepSince(formatDateLong(activeSleepStartedAt, family.language))}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={labels.end}
        onPress={handleEndSleep}
        style={[styles.stopButton, { backgroundColor: activeAccent.primary }]}
      >
        <Text style={[styles.stopButtonText, { color: '#fff' }]}>
          {homeSleep.activeSleepStopButton}
        </Text>
      </Pressable>
    </View>
  ) : null;

  // Idle sleep card — last session date or "no session" placeholder
  const lastSleep = filteredSessions.length > 0 ? filteredSessions[filteredSessions.length - 1] : null;

  return (
    <Screen testID="screen-sleep" scroll>
      <FlowHeader
        title={labels.title}
        subtitle={labels.subtitle(activeChild.displayName)}
        storybookTitle={dictionary.storybook.sleep}
      />

      <TwinPickerCards compact />

      {/* Active sleep SectionCard */}
      {activeSleepStartedAt ? (
        <SectionCard
          sectionType="sleep"
          title={homeSleep.sectionSleep}
          iconEmoji="🌙"
          footerLabel={homeSleep.viewHistory}
          onFooterPress={() => navigation.navigate('SleepHistory')}
        >
          {activeSleepBody}
        </SectionCard>
      ) : (
        <SectionCard
          sectionType="sleep"
          title={homeSleep.sectionSleep}
          iconEmoji="🌙"
          label={homeSleep.idleSleepLabel}
          value={
            lastSleep
              ? formatDateLong(lastSleep.startedAt, family.language)
              : homeSleep.noSessionYet
          }
          onPlusPress={handleStartSleep}
          plusAccessibilityLabel={labels.start}
          footerLabel={homeSleep.viewHistory}
          onFooterPress={() => navigation.navigate('SleepHistory')}
        />
      )}

      <Modal
        animationType="slide"
        onRequestClose={() => setShowTimerSheet(false)}
        transparent
        visible={showTimerSheet && Boolean(activeSleepStartedAt)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close sleep timer"
            onPress={() => setShowTimerSheet(false)}
            style={styles.modalBackdrop}
          />
          <View style={[styles.sheetCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.promptTitle, rtlText, { color: theme.text }]}>
              {showWakePrompt ? labels.wakePrompt : labels.timerTitle}
            </Text>
            {showWakePrompt ? (
              <>
                <TextInput
                  value={wakeCountDraft}
                  onChangeText={setWakeCountDraft}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={theme.mutedText}
                  style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
                />
                <View style={styles.promptActions}>
                  <Pressable
                    onPress={() => setShowWakePrompt(false)}
                    style={[styles.secondaryButton, { borderColor: theme.border }]}
                  >
                    <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                      {commonLabels.cancel}
                    </Text>
                  </Pressable>
                  <Pressable onPress={handleSaveSleep} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>{labels.save}</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.timerStatus, rtlText, { color: theme.mutedText }]}>
                  {timerPaused
                    ? labels.timerPaused
                    : activeSleepStartedAt
                      ? labels.timerRunning(getRunningDuration(activeSleepStartedAt, family.language))
                      : ''}
                </Text>
                <View style={styles.promptActions}>
                  <Pressable
                    onPress={() => setTimerPaused((current) => !current)}
                    style={[styles.secondaryButton, { borderColor: theme.border }]}
                  >
                    <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                      {timerPaused ? labels.resume : labels.pause}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel="End sleep session"
                    onPress={handleEndSleep}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>{labels.end}</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <GroupedHistoryCard
        days={historyDays}
        windowLabel={grouped.lastWeek}
        emptyLabel={grouped.emptyWeek}
        onPress={() => navigation.navigate('SleepHistory')}
        testID="sleep-inline-history"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Active sleep card body
  activeSleepBody: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeSleepLeft: {
    flex: 1,
    gap: 4,
  },
  activeSleepLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  activeSleepTimer: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  activeSleepSince: {
    fontSize: 12,
    lineHeight: 16,
  },
  stopButton: {
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  stopButtonText: {
    fontSize: 14,
    fontWeight: '900',
  },
  // Modal / sheet styles (unchanged from original)
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
    paddingBottom: 26,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  timerStatus: {
    color: '#6B7D91',
    lineHeight: 20,
  },
  promptActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
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
