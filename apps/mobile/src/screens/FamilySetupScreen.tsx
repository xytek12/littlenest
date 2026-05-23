import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

const familyOptions = [
  {
    id: 'single-boy',
    title: 'One baby',
    subtitle: 'Light blue or light pink, depending on the baby.',
    accent: colors.blue,
  },
  {
    id: 'twins-same',
    title: 'Twins, same sex',
    subtitle: 'Both boys stay blue. Both girls stay pink.',
    accent: colors.pink,
  },
  {
    id: 'twins-mixed',
    title: 'Twins, boy + girl',
    subtitle: 'Split the interface between light blue and light pink.',
    accent: colors.berry,
  },
] as const;

export function FamilySetupScreen() {
  const theme = useAppTheme();
  const [selectedOption, setSelectedOption] = useState<string>('single-boy');

  return (
    <Screen testID="screen-family-setup" scroll>
      <Text style={[styles.title, { color: theme.text }]}>Family setup</Text>
      <Text style={styles.subtitle}>
        Choose the family mode you want to test first. We can switch the theme rules later.
      </Text>

      {familyOptions.map((option) => {
        const selected = selectedOption === option.id;

        return (
          <ActionCard
            key={option.id}
            title={option.title}
            subtitle={option.subtitle}
            accent={option.accent}
            onPress={() => setSelectedOption(option.id)}
          >
            {selected ? <Text style={styles.selected}>Selected for this prototype</Text> : null}
          </ActionCard>
        );
      })}

      <View
        style={[
          styles.summaryCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.summaryTitle, { color: theme.text }]}>Prototype note</Text>
        <Text style={styles.summaryText}>
          This first build stays admin-only, with one family profile and friendly mock data until
          live syncing is connected.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#6B7D91',
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 20,
  },
  selected: {
    color: colors.berry,
    fontWeight: '700',
    marginTop: 10,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  summaryText: {
    color: '#6B7D91',
    lineHeight: 20,
  },
});
