import { StyleSheet, Text, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

export function TwinsHomeScreen() {
  const theme = useAppTheme();

  return (
    <Screen testID="screen-twins-home">
      <Text style={[styles.title, { color: theme.text }]}>Twins dashboard</Text>
      <View style={styles.row}>
        <View
          style={[
            styles.childCard,
            {
              backgroundColor: theme.surface,
              borderColor: colors.blue,
            },
          ]}
        >
          <Text style={[styles.childName, { color: colors.blue }]}>Baby A</Text>
          <Text style={[styles.childText, { color: theme.text }]}>Nap around 13:10</Text>
          <Text style={[styles.childText, { color: theme.text }]}>Apple 1/3</Text>
        </View>
        <View
          style={[
            styles.childCard,
            {
              backgroundColor: theme.surface,
              borderColor: colors.pink,
            },
          ]}
        >
          <Text style={[styles.childName, { color: colors.pink }]}>Baby B</Text>
          <Text style={[styles.childText, { color: theme.text }]}>Feed around 11:35</Text>
          <Text style={[styles.childText, { color: theme.text }]}>Pear 3/3</Text>
        </View>
      </View>
      <ActionCard
        title="AI comparison"
        subtitle="Baby A may need sleep first. Baby B may need feeding first."
        accent={colors.sage}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  childCard: { flex: 1, borderWidth: 1, borderRadius: 22, padding: 14 },
  childName: { fontWeight: '900', marginBottom: 6 },
  childText: { lineHeight: 20 },
});
