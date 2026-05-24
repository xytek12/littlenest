import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { FlowHeader } from '../components/FlowHeader';
import { Screen } from '../components/Screen';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import { formatDurationSeconds } from '../utils/formatDuration';
import { useTickEverySecond } from '../utils/useTickEverySecond';

function formatTimestamp(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getRunningDuration(startedAt: string) {
  return formatDurationSeconds(
    Math.max(0, Math.round((Date.now() - Date.parse(startedAt)) / 1000)),
    true,
  );
}

function isWithinLastThreeMonths(value: string) {
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  return Date.now() - Date.parse(value) <= ninetyDaysMs;
}

export function SleepScreen() {
  const theme = useAppTheme();
  const { activeChild, activeSleepStartedAt, endSleep, family, sleepSessions, startSleep } =
    usePrototypeState();
  const labels = getDictionary(family.language).sleep;
  const commonLabels = getDictionary(family.language).common;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const [wakeCountDraft, setWakeCountDraft] = useState('0');
  const [showTimerSheet, setShowTimerSheet] = useState(false);
  const [showWakePrompt, setShowWakePrompt] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const isSleepActive = activeSleepStartedAt != null && !timerPaused;
  useTickEverySecond(isSleepActive);
  const recentSessions = useMemo(
    () => sleepSessions.filter((session) => isWithinLastThreeMonths(session.startedAt)).slice(0, 12),
    [sleepSessions],
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
      <FlowHeader title={labels.title} subtitle={labels.subtitle(activeChild.displayName)} />

      <ActionCard
        title={activeSleepStartedAt ? labels.running : labels.start}
        subtitle={
          activeSleepStartedAt
            ? labels.runningSubtitle(
                formatTimestamp(activeSleepStartedAt),
                getRunningDuration(activeSleepStartedAt),
              )
            : labels.startSubtitle
        }
        accent={colors.blue}
        onPress={activeSleepStartedAt ? () => setShowTimerSheet(true) : handleStartSleep}
      />
      <ActionCard
        title={labels.end}
        subtitle={labels.endSubtitle}
        accent={colors.blue}
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
                  placeholderTextColor="#8B99AA"
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
                <Text style={[styles.timerStatus, rtlText]}>
                  {timerPaused
                    ? labels.timerPaused
                    : activeSleepStartedAt
                      ? labels.timerRunning(getRunningDuration(activeSleepStartedAt))
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

      <View style={[styles.statusCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.statusTitle, rtlText, { color: theme.text }]}>{labels.latest}</Text>
        {recentSessions.length > 0 ? (
          recentSessions.map((session) => (
            <Text key={session.id} style={[styles.logText, rtlText]}>
              {labels.logLine(
                formatTimestamp(session.startedAt),
                formatTimestamp(session.endedAt),
                formatDurationSeconds(session.durationSeconds, true),
                session.wakeCount,
              )}
            </Text>
          ))
        ) : (
          <Text style={[styles.logText, rtlText]}>{commonLabels.noHistory}</Text>
        )}
      </View>
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
  statusCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  logText: {
    color: '#6B7D91',
    lineHeight: 20,
    marginTop: 4,
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
