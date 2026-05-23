import { StyleSheet, Text } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

export function AiScreen() {
  const theme = useAppTheme();

  return (
    <Screen testID="screen-ai">
      <Text style={[styles.title, { color: theme.text }]}>AI</Text>
      <ActionCard
        title="Sleep prediction"
        subtitle="Compare Gemini and OpenAI in admin mode."
        accent={colors.blue}
      />
      <ActionCard
        title="Recipe ideas"
        subtitle="Search with trusted sources first."
        accent={colors.pink}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900', marginBottom: 16 },
});
