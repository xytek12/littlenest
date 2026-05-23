import { StyleSheet, Text, View } from 'react-native';
import type { ConfidenceLabel } from '../types/domain';

export function ConfidenceBadge({ label }: { label: ConfidenceLabel }) {
  const color = label === 'High' ? '#5EA96E' : label === 'Medium' ? '#F0C979' : '#B95773';

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: { fontWeight: '800', fontSize: 12 },
});
