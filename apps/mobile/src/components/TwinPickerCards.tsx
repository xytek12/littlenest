import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { getChildAccent, getPalette, typography } from '../theme';
import { useAppTheme } from '../theme/useAppTheme';
import { getAgeLabel } from '../utils/age';

type Props = {
  // When true (default on Home), shows the 🛏️/🍼/📏 quick-list rows under the
  // age. The detail screens that just need a child picker pass `compact`.
  compact?: boolean;
};

// Reusable twin-picker. Renders two side-by-side cards (one per child) and
// makes the tapped child the globally-active child via selectChild().
// Returns null for single-baby families so callers can render it
// unconditionally near the top of any screen.
export function TwinPickerCards({ compact = false }: Props = {}) {
  const theme = useAppTheme();
  const { activeChild, family, selectChild } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.home;

  if (family.mode !== 'twins' || family.children.length < 2) {
    return null;
  }

  const rtl = isRtlLanguage(family.language);
  const palette = getPalette({ mode: 'twins', twinType: family.twinType });

  return (
    <View style={styles.row}>
      {family.children.map((child, index) => {
        const accent = getChildAccent(child, index, palette);
        const isActive = activeChild.id === child.id;
        return (
          <Pressable
            key={child.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => selectChild(child.id)}
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: accent.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.name,
                { color: accent.primaryDeep },
                rtl ? styles.rtlText : null,
              ]}
            >
              {child.displayName}
            </Text>
            <Text
              style={[
                styles.age,
                { color: theme.mutedText },
                rtl ? styles.rtlText : null,
              ]}
            >
              {getAgeLabel(child.dateOfBirth, new Date(), family.language)}
            </Text>
            {compact ? null : (
              <View style={styles.quickList}>
                <Text style={[styles.quickRow, { color: theme.text }]}>
                  🛏️ {labels.sleepTitle}
                </Text>
                <Text style={[styles.quickRow, { color: theme.text }]}>
                  🍼 {labels.feedTitle}
                </Text>
                <Text style={[styles.quickRow, { color: theme.text }]}>
                  📏 {dictionary.growth.title}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.chip,
                { backgroundColor: accent.primarySoft, borderColor: accent.primary },
              ]}
            >
              <Text style={[styles.chipText, { color: accent.primaryDeep }]}>
                {isActive ? labels.twinActive : labels.twinTapToFocus}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  card: {
    borderRadius: 22,
    borderWidth: 2,
    flex: 1,
    padding: 14,
  },
  name: {
    fontFamily: typography.displayBold,
    fontSize: 20,
    fontWeight: '900',
  },
  age: {
    fontFamily: typography.body,
    fontSize: 12,
    marginTop: 2,
  },
  quickList: {
    gap: 4,
    marginTop: 10,
  },
  quickRow: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontFamily: typography.bodyBlack,
    fontSize: 11,
    fontWeight: '900',
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
