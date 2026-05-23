import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { AiSuggestionCard } from '../components/AiSuggestionCard';
import { FoodTestProgress } from '../components/FoodTestProgress';
import { Screen } from '../components/Screen';
import { mockAiSuggestion, mockFood } from '../data/mockSeed';
import { schedulePrototypeReminder } from '../notifications/localReminders';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { getAccentTheme } from '../theme/theme';
import { useAppTheme } from '../theme/useAppTheme';
import { getAgeLabel } from '../utils/age';

export function HomeScreen() {
  const theme = useAppTheme();
  const { activeChild, editFamily, family, logs } = usePrototypeState();
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const accent = getAccentTheme(
    family.mode === 'twins'
      ? { mode: 'twins', twinType: family.twinType ?? 'boy_girl' }
      : { mode: 'single', sex: activeChild.sex },
  );

  async function handleNapReminder() {
    const id = await schedulePrototypeReminder({
      title: 'Possible nap window soon',
      body: 'LittleNest AI thinks the next nap window may be close.',
      secondsFromNow: 60,
    });

    setReminderMessage(id ? 'Nap reminder scheduled for one minute from now.' : 'Reminder permission was not granted yet.');
  }

  return (
    <Screen testID="screen-home" scroll>
      <View style={styles.header}>
        <View>
          <Text style={[styles.kicker, { color: '#6B7D91' }]}>Good morning</Text>
          <Text style={[styles.title, { color: theme.text }]}>{activeChild.displayName}</Text>
          <Text style={[styles.subtitle, { color: '#6B7D91' }]}>
            {getAgeLabel(activeChild.dateOfBirth)}
          </Text>
        </View>
      </View>

      <AiSuggestionCard
        title={mockAiSuggestion.title}
        explanation={`Based on ${activeChild.displayName}'s current test profile and recent logs.`}
        confidence={mockAiSuggestion.confidence}
        accent={accent.primary}
      />

      <ActionCard
        title="Sleep"
        subtitle="Last nap ended at 09:35"
        accent={colors.blue}
        onPress={handleNapReminder}
      />
      <ActionCard title="Feed" subtitle="Likely hungry near 11:40" accent={colors.sage} />
      <ActionCard
        title="Family setup"
        subtitle={family.mode === 'twins' ? 'Edit twins test profile.' : 'Edit child test profile.'}
        accent={accent.secondary ?? accent.primary}
        onPress={editFamily}
      />
      <ActionCard
        title="Food tasting"
        subtitle={`${mockFood.name} test progress`}
        accent={colors.pink}
      >
        <FoodTestProgress count={mockFood.testCount} accent={colors.pink} />
      </ActionCard>

      {reminderMessage ? <Text style={styles.reminderMessage}>{reminderMessage}</Text> : null}
      {logs.slice(0, 3).map((log) => (
        <Text key={log.id} style={styles.logLine}>
          {log.title}: {log.note}
        </Text>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 16 },
  kicker: { fontWeight: '700' },
  title: { fontSize: 32, fontWeight: '900' },
  subtitle: { marginTop: 2 },
  reminderMessage: {
    color: '#36506B',
    marginTop: 4,
    lineHeight: 20,
  },
  logLine: {
    color: '#6B7D91',
    lineHeight: 20,
    marginTop: 4,
  },
});
