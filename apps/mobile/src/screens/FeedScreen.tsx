import { StyleSheet, Text } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

export function FeedScreen() {
  const theme = useAppTheme();

  return (
    <Screen testID="screen-feed">
      <Text style={[styles.title, { color: theme.text }]}>Feed</Text>
      <ActionCard
        title="Bottle / nursing"
        subtitle="Record type and amount."
        accent={colors.sage}
      />
      <ActionCard
        title="Hunger note"
        subtitle="Add signs like rooting, crying, or calm."
        accent={colors.berry}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900', marginBottom: 16 },
});
