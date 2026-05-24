import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  count: number;
  accent: string;
  itemName: string;
  onSelect: (count: number) => void;
};

export function FoodTestProgress({ count, accent, itemName, onSelect }: Props) {
  return (
    <View>
      <View style={styles.row}>
        {[1, 2, 3].map((step) => (
          <Pressable
            key={step}
            accessibilityRole="button"
            accessibilityLabel={`Mark ${itemName} as ${step} ${step === 1 ? 'check' : 'checks'}`}
            onPress={() => onSelect(step)}
            style={[
              styles.stepButton,
              {
                backgroundColor: count >= step ? accent : '#E6EDF5',
                borderColor: count >= step ? accent : '#D3DEEA',
              },
            ]}
          >
            <Text style={[styles.stepText, { color: count >= step ? '#FFFFFF' : '#52677D' }]}>
              {step}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  stepButton: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '900',
  },
});
