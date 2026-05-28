import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
    const windowed = entriesInLastDays(filteredSessions, (session) => session.startedAt, 7);
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

  const lastSleep = filteredSessions.length > 0 ? filteredSessions[filteredSessions.length - 1] : null;

  // Open the timer sheet without starting sleep — user confirms inside.
  function handleOpenSheet() {
    setShowTimerSheet(true);
    setShowWakePrompt(false);
    setTimerPaused(false);
    setWakeCountDraft('0');
  }

  function handleConfirmStart() {
    startSleep();
    setTimerPaused(false);
  }

  function handleEndSleep() {
    if (!activeSleepStartedAt) return;
    setShowWakePrompt(true);
  }

  function handleSaveSleep() {
    endSleep({ wakeCount: Number.parseInt(wakeCountDraft, 10) || 0 });
    setShowTimerSheet(false);
    setShowWakePrompt(false);
    setTimerPaused(false);
    setWakeCountDraft('0');
  }

  function handleCloseSheet() {
    setShowTimerSheet(false);
    setShowWakePrompt(false);
  }

  return (
    <Screen testID="screen-sleep" scroll>
      <FlowHeader
        title={labels.title}
        subtitle={labels.subtitle(activeChild.displayName)}
        storybookTitle={dictionary.storybook.sleep}
      />

      <TwinPickerCards compact />

      {/* Sleep SectionCard — "+" always opens the timer sheet */}
      {activeSleepStartedAt ? (
        <SectionCard
          sectionType="sleep"
          title={homeSleep.sectionSleep}
          iconEmoji="🌙"
          label={homeSleep.activeSleepLabel}
          value={getRunningDuration(activeSleepStartedAt, family.language)}
          rightLabel={homeSleep.activeSleepSince(formatDateLong(activeSleepStartedAt, family.language))}
          onPlusPress={handleOpenSheet}
          plusAccessibilityLabel={labels.end}
          footerLabel={homeSleep.viewHistory}
          onFooterPress={() => navigation.navigate('SleepHistory')}
        />
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
          onPlusPress={handleOpenSheet}
          plusAccessibilityLabel={labels.start}
          footerLabel={homeSleep.viewHistory}
          onFooterPress={() => navigation.navigate('SleepHistory')}
        />
      )}

      {/* Timer sheet — pre-start, running, and wake-count states */}
      <Modal
        animationType="slide"
        onRequestClose={handleCloseSheet}
        transparent
        visible={showTimerSheet}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              accessibilityLabel="Close sleep timer"
              onPress={handleCloseSheet}
              style={styles.modalBackdrop}
            />
            <View style={[styles.sheetCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>

                {/* PRE-START: timer not yet running */}
                {!activeSleepStartedAt && !showWakePrompt ? (
                  <>
                    <Text style={[styles.promptTitle, rtlText, { color: theme.text }]}>
                      {labels.timerTitle}
                    </Text>
                    <Text style={[styles.timerStatus, rtlText, { color: theme.mutedText }]}>
                      {labels.startSubtitle}
                    </Text>
                    <View style={styles.promptActions}>
                      <Pressable
                        onPress={handleCloseSheet}
                        style={[styles.secondaryButton, { borderColor: theme.border }]}
                      >
                        <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                          {commonLabels.cancel}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={handleConfirmStart}
                        style={[styles.primaryButton, { backgroundColor: activeAccent.primary }]}
                      >
                        <Text style={[styles.primaryButtonText, { color: activeAccent.primaryDeep }]}>
                          {labels.start}
                        </Text>
                      </Pressable>
                    </View>
                  </>

                ) : showWakePrompt ? (
                  /* WAKE COUNT: how many times did baby wake? */
                  <>
                    <Text style={[styles.promptTitle, rtlText, { color: theme.text }]}>
                      {labels.wakePrompt}
                    </Text>
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
                  /* RUNNING: timer active */
                  <>
                    <Text style={[styles.promptTitle, rtlText, { color: theme.text }]}>
                      {labels.timerTitle}
                    </Text>
                    <Text style={[styles.timerStatus, rtlText, { color: theme.mutedText }]}>
                      {timerPaused
                        ? labels.timerPaused
                        : activeSleepStartedAt
                          ? labels.timerRunning(getRunningDuration(activeSleepStartedAt, family.language))
                          : ''}
                    </Text>
                    <View style={styles.promptActions}>
                      <Pressable
                        onPress={() => setTimerPaused((cur) => !cur)}
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
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Inline 7-day history preview — tap to open full history */}
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
  flex: { flex: 1 },
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
    lineHeight: 20,
    marginBottom: 4,
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
