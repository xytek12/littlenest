import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { FlowHeader } from '../components/FlowHeader';
import { InlineHistoryCard, type InlineHistoryRow } from '../components/InlineHistoryCard';
import { Screen } from '../components/Screen';
import { TwinSelector } from '../components/TwinSelector';
import { getDictionary, isRtlLanguage } from '../i18n';
import type { SleepStackParamList } from '../navigation/RootNavigator';
import { usePrototypeState } from '../state/PrototypeState';
import { getChildAccent, getPalette } from '../theme';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import { formatDurationHuman, formatDurationSeconds } from '../utils/formatDuration';
import { formatHistoryDate, formatHistoryTime } from '../utils/formatHistoryDate';
import { entriesInLast24h } from '../utils/historyFilters';
import { useTickEverySecond } from '../utils/useTickEverySecond';

function formatTimestamp(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

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
    selectChild,
    sleepSessions,
    startSleep,
  } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.sleep;
  const commonLabels = dictionary.common;
  const story = dictionary.storybook;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const isTwins = family.mode === 'twins';
  const palette = getPalette(
    isTwins
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: activeChild.sex },
  );
  const activeIndex = family.children.findIndex((child) => child.id === activeChild.id);
  const activeAccent = getChildAccent(activeChild, Math.max(0, activeIndex), palette);
  const [twinFilter, setTwinFilter] = useState<string | null>(isTwins ? activeChild.id : null);
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
    if (!isTwins || twinFilter == null) return sleepSessions;
    return sleepSessions.filter((session) => session.childId === twinFilter);
  }, [isTwins, sleepSessions, twinFilter]);

  const inlineRows = useMemo<InlineHistoryRow[]>(
    () =>
      entriesInLast24h(filteredSessions, (session) => session.startedAt)
        .slice(0, 5)
        .map((session) => {
          const child = childById.get(session.childId);
          const childIndex = family.children.findIndex((c) => c.id === session.childId);
          const accent = child
            ? getChildAccent(child, Math.max(0, childIndex), palette)
            : { primary: palette.primary };
          return {
            key: session.id,
            primary: labels.history.row(
              formatHistoryDate(session.startedAt, family.language),
              formatHistoryTime(session.startedAt, family.language),
              formatDurationHuman(session.durationSeconds, family.language),
              session.wakeCount,
            ),
            secondary: isTwins ? child?.displayName : undefined,
            accentColor: isTwins ? accent.primary : colors.blue,
          };
        }),
    [childById, family.children, family.language, filteredSessions, isTwins, labels.history, palette],
  );
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

  return (
    <Screen testID="screen-sleep" scroll>
      <FlowHeader
        title={labels.title}
        subtitle={labels.subtitle(activeChild.displayName)}
        storybookTitle={story.sleep}
      />

      {isTwins ? (
        <TwinSelector
          selectedChildId={twinFilter}
          onSelect={(id) => {
            setTwinFilter(id);
            if (id) selectChild(id);
          }}
        />
      ) : null}

      <ActionCard
        title={activeSleepStartedAt ? labels.running : labels.start}
        subtitle={
          activeSleepStartedAt
            ? labels.runningSubtitle(
                formatTimestamp(activeSleepStartedAt),
                getRunningDuration(activeSleepStartedAt, family.language),
              )
            : labels.startSubtitle
        }
        accent={activeAccent.primary}
        onPress={activeSleepStartedAt ? () => setShowTimerSheet(true) : handleStartSleep}
      />
      <ActionCard
        title={labels.end}
        subtitle={labels.endSubtitle}
        accent={activeAccent.primary}
        onPress={canEnd ? handleEndSleep : undefined}
      />

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

      <InlineHistoryCard
        rows={inlineRows}
        onPress={() => navigation.navigate('SleepHistory')}
        testID="sleep-inline-history"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
