import { StyleSheet, Text, View } from 'react-native';
import { getFoodTestStatus } from '../utils/foodTests';

type Props = {
  count: number;
  accent: string;
};

export function FoodTestProgress({ count, accent }: Props) {
  return (
    <View>
      <Text style={styles.label}>{getFoodTestStatus(count)}</Text>
      <View style={styles.row}>
        {[1, 2, 3].map((step) => (
          <View
            key={step}
            style={[styles.dot, { backgroundColor: count >= step ? accent : '#E6EDF5' }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: '#6B7D91', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 6 },
  dot: { width: 28, height: 8, borderRadius: 8 },
});
