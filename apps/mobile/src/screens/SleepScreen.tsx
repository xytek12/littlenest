import { StyleSheet, Text, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

export function SleepScreen() {
  const theme = useAppTheme();
  const { activeChild, activeSleepStartedAt, endSleep, logs, startSleep } = usePrototypeState();
  const sleepLogs = logs.filter((log) => log.type === 'sleep').slice(0, 4);

  return (
    <Screen testID="screen-sleep" scroll>
      <Text style={[styles.title, { color: theme.text }]}>Sleep</Text>
      <Text style={styles.subtitle}>
        {activeSleepStartedAt
          ? `${activeChild.displayName} is sleeping now.`
          : `Ready to track ${activeChild.displayName}'s next sleep.`}
      </Text>
      <ActionCard
        title="Start sleep"
        subtitle={activeSleepStartedAt ? 'Sleep is already running.' : 'Record when the nap begins.'}
        accent={colors.blue}
        onPress={activeSleepStartedAt ? undefined : startSleep}
      />
      <ActionCard
        title="End sleep"
        subtitle={activeSleepStartedAt ? 'Record wake-up time and mood.' : 'Save a wake-up note.'}
        accent={colors.blue}
        onPress={() => endSleep('Woke up calm')}
      />
      <View style={[styles.statusCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.statusTitle, { color: theme.text }]}>Latest sleep notes</Text>
        {sleepLogs.length > 0 ? (
          sleepLogs.map((log) => (
            <Text key={log.id} style={styles.logText}>
              {log.title}: {log.note}
            </Text>
          ))
        ) : (
          <Text style={styles.logText}>No sleep session recorded yet.</Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900', marginBottom: 16 },
  subtitle: {
    color: '#6B7D91',
    lineHeight: 20,
    marginBottom: 14,
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
