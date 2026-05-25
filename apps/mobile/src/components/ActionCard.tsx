import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { paletteBase, typography } from '../theme';
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
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: paletteBase.borderSoft,
        },
      ]}
      disabled={!onPress}
    >
      <View style={[styles.marker, { backgroundColor: accent }]} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.mutedText }]}>{subtitle}</Text>
        {children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  marker: { width: 7, borderRadius: 8 },
  body: { flex: 1 },
  title: {
    fontFamily: typography.displayBold,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    fontFamily: typography.body,
    lineHeight: 20,
    marginTop: 5,
  },
});
