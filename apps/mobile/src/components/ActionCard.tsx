import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/useAppTheme';

type Props = PropsWithChildren<{
  title: string;
  subtitle: string;
  accent: string;
  onPress?: () => void;
}>;

export function ActionCard({ title, subtitle, accent, onPress, children }: Props) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
      disabled={!onPress}
    >
      <View style={[styles.marker, { backgroundColor: accent }]} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  marker: { width: 7, borderRadius: 8 },
  body: { flex: 1 },
  title: { fontSize: 18, fontWeight: '900' },
  subtitle: { color: '#6B7D91', marginTop: 5, lineHeight: 20 },
});
