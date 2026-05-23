import { StyleSheet, Text } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

export function SleepScreen() {
  const theme = useAppTheme();

  return (
    <Screen testID="screen-sleep">
      <Text style={[styles.title, { color: theme.text }]}>Sleep</Text>
      <ActionCard
        title="Start sleep"
        subtitle="Record when the nap begins."
        accent={colors.blue}
      />
      <ActionCard
        title="End sleep"
        subtitle="Record wake-up time and mood."
        accent={colors.blue}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900', marginBottom: 16 },
});
