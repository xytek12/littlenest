import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import type { RootTabParamList } from '../navigation/RootNavigator';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { getAccentTheme } from '../theme/theme';
import { useAppTheme } from '../theme/useAppTheme';
import { getAgeLabel } from '../utils/age';

function countTrackedDays(
  sleepSessions: { startedAt: string }[],
  feedEntries: { timestamp: string }[],
) {
  const keys = new Set<string>();

  sleepSessions.forEach((session) => keys.add(session.startedAt.slice(0, 10)));
  feedEntries.forEach((entry) => keys.add(entry.timestamp.slice(0, 10)));

  return keys.size;
}

export function HomeScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const {
    activeChild,
    family,
    feedEntries,
    logs,
    sleepSessions,
  } = usePrototypeState();
  const accent = getAccentTheme(
    family.mode === 'twins'
      ? { mode: 'twins', twinType: family.twinType ?? 'boy_girl' }
      : { mode: 'single', sex: activeChild.sex },
  );
  const trackedDays = countTrackedDays(sleepSessions, feedEntries);
  const learningReady = trackedDays >= 14;

  return (
    <Screen testID="screen-home" scroll>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>{activeChild.displayName}</Text>
          <Text style={styles.subtitle}>{getAgeLabel(activeChild.dateOfBirth)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={() => navigation.navigate('Settings')}
          style={[styles.settingsButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
        >
          <Ionicons name="settings-outline" size={18} color={theme.text} />
        </Pressable>
      </View>

      <View
        style={[
          styles.learningCard,
          { borderColor: accent.primary, backgroundColor: theme.surface },
        ]}
      >
        <Text style={[styles.learningKicker, { color: accent.primary }]}>
          {learningReady ? 'AI suggestion' : 'LittleNest is learning'}
        </Text>
        <Text style={[styles.learningTitle, { color: theme.text }]}>
          {learningReady
            ? 'Predictions are ready for your latest routine.'
            : `Track sleep and feeds for 14 days to unlock smarter guidance.`}
        </Text>
        <Text style={styles.learningBody}>
          {learningReady
            ? `${activeChild.displayName}'s routine now has enough data for stronger sleep and hunger timing suggestions.`
            : `Right now LittleNest has ${trackedDays} tracked day${trackedDays === 1 ? '' : 's'}. Keep recording sleep and feed patterns so the AI can learn this child's real rhythm.`}
        </Text>
      </View>

      <ActionCard
        title="Sleep"
        subtitle="Start or end a sleep session with a running timer."
        accent={accent.primary}
        onPress={() => navigation.navigate('SleepFlow')}
      />
      <ActionCard
        title="Feed"
        subtitle="Bottle or nursing with exact times and totals."
        accent={family.mode === 'single' && activeChild.sex === 'girl' ? colors.pink : colors.sage}
        onPress={() => navigation.navigate('FeedFlow')}
      />
      <ActionCard
        title="Food tasting"
        subtitle="Track first tastes, allergy checks, and what still needs testing."
        accent={accent.secondary ?? accent.primary}
        onPress={() => navigation.navigate('FoodTastingFlow')}
      />
      <ActionCard
        title="Family setup"
        subtitle={family.mode === 'twins' ? 'Edit the twins prototype profile.' : 'Edit the child prototype profile.'}
        accent={accent.secondary ?? accent.primary}
        onPress={() => navigation.navigate('Settings')}
      />

      {logs.slice(0, 3).map((log) => (
        <Text key={log.id} style={styles.logLine}>
          {log.title}: {log.note}
        </Text>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 32, fontWeight: '900' },
  subtitle: { color: '#6B7D91', marginTop: 2 },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learningCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  learningKicker: {
    fontWeight: '900',
    fontSize: 15,
  },
  learningTitle: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    marginTop: 8,
  },
  learningBody: {
    color: '#6B7D91',
    lineHeight: 22,
    marginTop: 10,
  },
  logLine: {
    color: '#6B7D91',
    lineHeight: 20,
    marginTop: 4,
  },
});
