import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { FlowHeader } from '../components/FlowHeader';
import { Screen } from '../components/Screen';
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
  const [wakeCountDraft, setWakeCountDraft] = useState('0');
  const [showWakePrompt, setShowWakePrompt] = useState(false);
  const latestSession = sleepSessions[0];
  const canEnd = Boolean(activeSleepStartedAt);
  const recentSummary = useMemo(
    () =>
      latestSession
        ? `${formatTimestamp(latestSession.startedAt)}-${formatTimestamp(latestSession.endedAt)} | ${latestSession.durationMinutes} min | wakes ${latestSession.wakeCount}`
        : 'No sleep session recorded yet.',
    [latestSession],
  );

  function handleStartSleep() {
    startSleep();
    setShowWakePrompt(false);
    setWakeCountDraft('0');
  }

  function handleEndSleep() {
    if (!canEnd) {
      return;
    }

    setShowWakePrompt(true);
  }

  function handleSaveSleep() {
    endSleep({ wakeCount: Number.parseInt(wakeCountDraft, 10) || 0 });
    setShowWakePrompt(false);
    setWakeCountDraft('0');
  }

  return (
    <Screen testID="screen-sleep" scroll>
      <FlowHeader
        title="Sleep"
        subtitle={`Track exact start and end times for ${activeChild.displayName}'s naps and night sleep.`}
      />

      <ActionCard
        title={activeSleepStartedAt ? 'Sleep is running' : 'Start sleep'}
        subtitle={
          activeSleepStartedAt
            ? `Started at ${formatTimestamp(activeSleepStartedAt)} and running for ${formatDuration(activeSleepStartedAt)}.`
            : 'Begin the timer when sleep starts.'
        }
        accent={colors.blue}
        onPress={activeSleepStartedAt ? undefined : handleStartSleep}
      />
      <ActionCard
        title="End sleep"
        subtitle="Save total sleep and wake count for this session."
        accent={colors.blue}
        onPress={canEnd ? handleEndSleep : undefined}
      />

      {showWakePrompt ? (
        <View style={[styles.promptCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.promptTitle, { color: theme.text }]}>How many times did the child wake up?</Text>
          <TextInput
            value={wakeCountDraft}
            onChangeText={setWakeCountDraft}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor="#8B99AA"
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          />
          <View style={styles.promptActions}>
            <Pressable onPress={() => setShowWakePrompt(false)} style={[styles.secondaryButton, { borderColor: theme.border }]}>
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSaveSleep} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Save sleep session</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={[styles.statusCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.statusTitle, { color: theme.text }]}>Latest sleep sessions</Text>
        {sleepSessions.length > 0 ? (
          sleepSessions.slice(0, 4).map((session) => (
            <Text key={session.id} style={styles.logText}>
              {formatTimestamp(session.startedAt)}-{formatTimestamp(session.endedAt)} | {session.durationMinutes} min | wakes {session.wakeCount}
            </Text>
          ))
        ) : (
          <Text style={styles.logText}>{recentSummary}</Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  promptCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
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
});
