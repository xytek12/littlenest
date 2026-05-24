import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { FlowHeader } from '../components/FlowHeader';
import { Screen } from '../components/Screen';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

function formatTimestamp(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(startedAt: string) {
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(startedAt)) / 60000));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) {
    return `${remainder} min`;
  }

  return `${hours}h ${remainder}m`;
}

export function SleepScreen() {
  const theme = useAppTheme();
  const { activeChild, activeSleepStartedAt, endSleep, sleepSessions, startSleep } = usePrototypeState();
  const { family } = usePrototypeState();
  const labels = getDictionary(family.language).sleep;
  const commonLabels = getDictionary(family.language).common;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const [wakeCountDraft, setWakeCountDraft] = useState('0');
  const [showTimerSheet, setShowTimerSheet] = useState(false);
  const [showWakePrompt, setShowWakePrompt] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const latestSession = sleepSessions[0];
  const canEnd = Boolean(activeSleepStartedAt);
  const recentSummary = useMemo(
    () =>
      latestSession
        ? labels.logLine(
            formatTimestamp(latestSession.startedAt),
            formatTimestamp(latestSession.endedAt),
            latestSession.durationMinutes,
            latestSession.wakeCount,
          )
        : labels.empty,
    [labels, latestSession],
  );

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
      />

      <ActionCard
        title={activeSleepStartedAt ? labels.running : labels.start}
        subtitle={
          activeSleepStartedAt
            ? labels.runningSubtitle(
                formatTimestamp(activeSleepStartedAt),
                formatDuration(activeSleepStartedAt),
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
                      ? labels.timerRunning(formatDuration(activeSleepStartedAt))
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
        {sleepSessions.length > 0 ? (
          sleepSessions.slice(0, 4).map((session) => (
            <Text key={session.id} style={[styles.logText, rtlText]}>
              {labels.logLine(
                formatTimestamp(session.startedAt),
                formatTimestamp(session.endedAt),
                session.durationMinutes,
                session.wakeCount,
              )}
            </Text>
          ))
        ) : (
          <Text style={[styles.logText, rtlText]}>{recentSummary}</Text>
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
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
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
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontWeight: '800',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.blue,
  },
  primaryButtonText: {
    color: '#0C2944',
    fontWeight: '900',
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: 18,
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
