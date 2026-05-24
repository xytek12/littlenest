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
  const backgroundColor = theme.isDark ? '#111C28' : '#F5FBFF';

  return (
    <View style={[styles.card, { backgroundColor, borderColor: accent }]}>
      <Text style={[styles.eyebrow, { color: accent }]}>AI suggestion</Text>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.explanation, { color: theme.mutedText }]}>{explanation}</Text>
      <ConfidenceBadge label={confidence} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 22, padding: 18, marginBottom: 12 },
  eyebrow: { fontSize: 13, fontWeight: '900', letterSpacing: 0 },
  title: { fontSize: 21, fontWeight: '900', lineHeight: 27, marginTop: 6 },
  explanation: { marginVertical: 10, lineHeight: 22 },
});
