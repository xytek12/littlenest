import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ChildSex } from '../types/domain';
import { getAccentTheme } from '../theme/theme';
import { useAppTheme } from '../theme/useAppTheme';

type Props = {
  title: string;
  summary: string;
  tag: string;
  imageUrl: string;
  childSex: ChildSex;
  onPress: () => void;
  ctaLabel?: string;
  dailyLabel?: string;
};

export function RecipeIdeaCard({
  title,
  summary,
  tag,
  imageUrl,
  childSex,
  onPress,
  ctaLabel = 'Open recipe source',
  dailyLabel = "Today's idea",
}: Props) {
  const theme = useAppTheme();
  const accent = getAccentTheme({ mode: 'single', sex: childSex });

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.tagRow}>
          <Text style={styles.tag}>{tag}</Text>
          <Text style={styles.dailyLabel}>{dailyLabel}</Text>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={styles.summary}>{summary}</Text>
        <Pressable
          onPress={onPress}
          style={[styles.button, { backgroundColor: accent.softPrimary }]}
        >
          <Text style={[styles.buttonText, { color: accent.primary }]}>{ctaLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
  },
  image: {
    width: '100%',
    height: 170,
    backgroundColor: '#DDE8F2',
  },
  body: {
    padding: 16,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  tag: {
    color: '#876001',
    backgroundColor: '#FFF5D7',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontWeight: '800',
    fontSize: 12,
  },
  dailyLabel: {
    color: '#6B7D91',
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    marginTop: 12,
  },
  summary: {
    color: '#536474',
    lineHeight: 22,
    marginTop: 8,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  buttonText: {
    fontWeight: '900',
    fontSize: 16,
  },
});
