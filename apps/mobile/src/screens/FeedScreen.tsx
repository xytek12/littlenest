import { StyleSheet, Text, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

export function FeedScreen() {
  const theme = useAppTheme();
  const { activeChild, logs, recordFeed } = usePrototypeState();
  const feedLogs = logs.filter((log) => log.type === 'feed').slice(0, 4);

  return (
    <Screen testID="screen-feed" scroll>
      <Text style={[styles.title, { color: theme.text }]}>Feed</Text>
      <Text style={styles.subtitle}>Quick feed tracking for {activeChild.displayName}.</Text>
      <ActionCard
        title="Bottle / nursing"
        subtitle="Record type and amount."
        accent={colors.sage}
        onPress={() => recordFeed('Bottle / nursing recorded')}
      />
      <ActionCard
        title="Hunger note"
        subtitle="Add signs like rooting, crying, or calm."
        accent={colors.berry}
        onPress={() => recordFeed('Hunger signs noted')}
      />
      <View style={[styles.statusCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.statusTitle, { color: theme.text }]}>Latest feed notes</Text>
        {feedLogs.length > 0 ? (
          feedLogs.map((log) => (
            <Text key={log.id} style={styles.logText}>
              {log.title}: {log.note}
            </Text>
          ))
        ) : (
          <Text style={styles.logText}>No feed note recorded yet.</Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900', marginBottom: 16 },
  subtitle: { color: '#6B7D91', lineHeight: 20, marginBottom: 14 },
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
