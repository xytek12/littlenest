import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getDictionary } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { getChildAccent, getPalette, paletteBase, typography } from '../theme';
import { useAppTheme } from '../theme/useAppTheme';

type Props = {
  // when null, "Both" segment is selected
  selectedChildId: string | null;
  onSelect: (childId: string | null) => void;
  showBoth?: boolean;
};

export function TwinSelector({ selectedChildId, onSelect, showBoth = true }: Props) {
  const theme = useAppTheme();
  const { family } = usePrototypeState();
  const labels = getDictionary(family.language).storybook;

  if (family.mode !== 'twins' || family.children.length < 2) {
    return null;
  }

  const palette = getPalette({ mode: 'twins', twinType: family.twinType });

  return (
    <View style={[styles.row, { backgroundColor: theme.surface, borderColor: paletteBase.borderSoft }]}>
      {family.children.map((child, index) => {
        const accent = getChildAccent(child, index, palette);
        const selected = selectedChildId === child.id;
        return (
          <Pressable
            key={child.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(child.id)}
            style={[
              styles.segment,
              {
                backgroundColor: selected ? accent.primarySoft : 'transparent',
                borderColor: selected ? accent.primary : 'transparent',
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: accent.primary }]} />
            <Text
              style={[
                styles.segmentText,
                { color: selected ? accent.primaryDeep : theme.text },
              ]}
              numberOfLines={1}
            >
              {child.displayName}
            </Text>
          </Pressable>
        );
      })}
      {showBoth ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: selectedChildId == null }}
          onPress={() => onSelect(null)}
          style={[
            styles.segment,
            {
              backgroundColor: selectedChildId == null ? palette.bridgeSoft ?? theme.surface : 'transparent',
              borderColor: selectedChildId == null ? palette.bridge ?? theme.border : 'transparent',
            },
          ]}
        >
          <Text style={[styles.segmentText, { color: theme.text }]}>{labels.bothTwins}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
    padding: 6,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  dot: {
    borderRadius: 6,
    height: 10,
    width: 10,
  },
  segmentText: {
    fontFamily: typography.bodyBlack,
    fontSize: 13,
    fontWeight: '900',
  },
});
