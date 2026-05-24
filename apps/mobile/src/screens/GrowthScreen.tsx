import { StyleSheet, Text } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

export function GrowthScreen() {
  const theme = useAppTheme();

  return (
    <Screen testID="screen-growth">
      <Text style={[styles.title, { color: theme.text }]}>Growth</Text>
      <ActionCard title="Weight" subtitle="Add a new weight entry." accent={colors.blue} />
      <ActionCard title="Height" subtitle="Track height changes over time." accent={colors.blue} />
      <ActionCard
        title="Head circumference"
        subtitle="Track changes over time."
        accent={colors.pink}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900', marginBottom: 16 },
});
