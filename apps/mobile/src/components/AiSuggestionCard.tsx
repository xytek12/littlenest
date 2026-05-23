import { StyleSheet, Text, View } from 'react-native';
import type { ConfidenceLabel } from '../types/domain';
import { useAppTheme } from '../theme/useAppTheme';
import { ConfidenceBadge } from './ConfidenceBadge';

type Props = {
  title: string;
  explanation: string;
  confidence: ConfidenceLabel;
  accent: string;
};

export function AiSuggestionCard({ title, explanation, confidence, accent }: Props) {
  const theme = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: accent }]}>
      <Text style={[styles.eyebrow, { color: accent }]}>AI suggestion</Text>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={styles.explanation}>{explanation}</Text>
      <ConfidenceBadge label={confidence} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 22, padding: 16, marginBottom: 12 },
  eyebrow: { fontSize: 12, fontWeight: '800' },
  title: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  explanation: { color: '#6B7D91', marginVertical: 8 },
});
