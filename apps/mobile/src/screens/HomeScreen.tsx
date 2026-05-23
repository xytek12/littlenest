import { StyleSheet, Text, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { AiSuggestionCard } from '../components/AiSuggestionCard';
import { FoodTestProgress } from '../components/FoodTestProgress';
import { Screen } from '../components/Screen';
import { mockAiSuggestion, mockChild, mockFood } from '../data/mockSeed';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import { getAgeLabel } from '../utils/age';

export function HomeScreen() {
  const theme = useAppTheme();

  return (
    <Screen testID="screen-home" scroll>
      <View style={styles.header}>
        <View>
          <Text style={[styles.kicker, { color: '#6B7D91' }]}>Good morning</Text>
          <Text style={[styles.title, { color: theme.text }]}>{mockChild.displayName}</Text>
          <Text style={[styles.subtitle, { color: '#6B7D91' }]}>
            {getAgeLabel(mockChild.dateOfBirth)}
          </Text>
        </View>
      </View>

      <AiSuggestionCard
        title={mockAiSuggestion.title}
        explanation={mockAiSuggestion.explanation}
        confidence={mockAiSuggestion.confidence}
        accent={colors.pink}
      />

      <ActionCard title="Sleep" subtitle="Last nap ended at 09:35" accent={colors.blue} />
      <ActionCard title="Feed" subtitle="Likely hungry near 11:40" accent={colors.sage} />
      <ActionCard
        title="Food tasting"
        subtitle={`${mockFood.name} test progress`}
        accent={colors.pink}
      >
        <FoodTestProgress count={mockFood.testCount} accent={colors.pink} />
      </ActionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 16 },
  kicker: { fontWeight: '700' },
  title: { fontSize: 32, fontWeight: '900' },
  subtitle: { marginTop: 2 },
});
