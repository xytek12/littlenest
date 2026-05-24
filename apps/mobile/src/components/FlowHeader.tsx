import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RootTabParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

type Props = {
  title: string;
  subtitle?: string;
};

export function FlowHeader({ title, subtitle }: Props) {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="Back to Home"
        accessibilityRole="button"
        onPress={() => navigation.navigate('Home')}
        style={[styles.backButton, { borderColor: theme.border }]}
      >
        <Text style={[styles.backText, { color: theme.text }]}>← Home</Text>
      </Pressable>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '900',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#6B7D91',
    lineHeight: 20,
    marginTop: 8,
  },
});
