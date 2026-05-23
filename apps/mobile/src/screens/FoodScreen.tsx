import { StyleSheet, Text } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

export function FoodScreen() {
  const theme = useAppTheme();

  return (
    <Screen testID="screen-food">
      <Text style={[styles.title, { color: theme.text }]}>Food</Text>
      <ActionCard
        title="Food tasting"
        subtitle="Mark 1/3, 2/3, or 3/3."
        accent={colors.pink}
      />
      <ActionCard
        title="Recipe search"
        subtitle="Find trusted ideas by age and language."
        accent={colors.warning}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900', marginBottom: 16 },
});
