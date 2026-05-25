import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/useAppTheme';

type Props = {
  count: number;
  accent: string;
  itemName: string;
  onSelect: (count: number) => void;
};

export function FoodTestProgress({ count, accent, itemName, onSelect }: Props) {
  const theme = useAppTheme();
  const inactiveBg = theme.isDark ? theme.background : '#E6EDF5';
  const inactiveBorder = theme.border;
  const inactiveText = theme.mutedText;

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
                backgroundColor: count >= step ? accent : inactiveBg,
                borderColor: count >= step ? accent : inactiveBorder,
              },
            ]}
          >
            <Text style={[styles.stepText, { color: count >= step ? '#FFFFFF' : inactiveText }]}>
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
