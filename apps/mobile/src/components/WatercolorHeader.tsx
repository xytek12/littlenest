import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { paletteBase, typography } from '../theme';
import { useAppTheme } from '../theme/useAppTheme';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  accent: string;
  accentSoft?: string;
  sparkles?: string;
  trailing?: ReactNode;
}>;

// Magical-storybook header: a soft gradient wash of the primary accent fading
// into the page background, with sparkle stars and an italic display title.
// Implemented without expo-linear-gradient so it keeps rendering even before
// the user runs `npm install`.
//
// Dark-mode aware: the bottom "paper" strip blends with the page background
// (not a fixed cream), and the title / subtitle / sparkles use theme text
// colours so they stay readable. The accent overlay opacity is also lowered
// in dark mode so the header doesn't look like a washed-out grey blob.
export function WatercolorHeader({
  title,
  subtitle,
  accent,
  accentSoft,
  sparkles = '⋆  ⋆  ⋆',
  trailing,
  children,
}: Props) {
  const theme = useAppTheme();
  const { family } = usePrototypeState();
  const rtl = isRtlLanguage(family.language);
  const rtlText = rtl ? styles.rtlText : null;
  const tintTop = accentSoft ?? accent;

  return (
    <View style={styles.wrapper}>
      <View
        pointerEvents="none"
        style={[
          styles.layerTop,
          { backgroundColor: tintTop, opacity: theme.isDark ? 0.32 : 0.55 },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.layerMid,
          { backgroundColor: accent, opacity: theme.isDark ? 0.22 : 0.18 },
        ]}
      />
      <View
        pointerEvents="none"
        style={[styles.layerBottom, { backgroundColor: theme.background }]}
      />

      <View style={styles.content}>
        <View style={styles.headerTopRow}>
          <Text
            style={[styles.sparkles, { color: theme.mutedText }, rtlText]}
            accessibilityElementsHidden
          >
            {sparkles}
          </Text>
          {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
        </View>
        <Text
          style={[styles.title, { color: theme.text }, rtlText]}
          numberOfLines={2}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.subtitle, { color: theme.mutedText }, rtlText]}
            numberOfLines={3}
          >
            {subtitle.split(/(\d+)/).map((part, index) =>
              /^\d+$/.test(part) ? (
                <Text key={`n-${index}`} style={styles.subtitleNumber}>
                  {part}
                </Text>
              ) : (
                part
              ),
            )}
          </Text>
        ) : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 26,
    marginBottom: 18,
    overflow: 'hidden',
    paddingBottom: 4,
  },
  layerTop: {
    height: '100%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  layerMid: {
    height: 70,
    left: -20,
    position: 'absolute',
    right: -20,
    top: 30,
    transform: [{ rotate: '-2deg' }],
  },
  layerBottom: {
    bottom: 0,
    height: 30,
    left: 0,
    opacity: 0.85,
    position: 'absolute',
    right: 0,
  },
  content: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  headerTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sparkles: {
    fontSize: 13,
    letterSpacing: 4,
    opacity: 0.7,
  },
  trailing: {
    marginLeft: 8,
  },
  title: {
    fontFamily: typography.displayItalic,
    fontSize: 30,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 36,
    marginTop: 2,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  subtitleNumber: {
    fontFamily: typography.bodyBlack,
    fontSize: 17,
    fontWeight: '800',
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});

// (paletteBase is intentionally still imported above in case a downstream
//  consumer extends this file — kept for parity with the original module.)
void paletteBase;
