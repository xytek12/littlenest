import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { paletteBase, typography } from '../theme';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  accent: string;
  accentSoft?: string;
  sparkles?: string;
  trailing?: ReactNode;
}>;

// Magical-storybook header: a soft gradient wash of the primary accent fading
// into the cream paper, with sparkle stars and an italic display title.
// Implemented without expo-linear-gradient so it keeps rendering even before
// the user runs `npm install`.
export function WatercolorHeader({
  title,
  subtitle,
  accent,
  accentSoft,
  sparkles = '⋆  ⋆  ⋆',
  trailing,
  children,
}: Props) {
  const { family } = usePrototypeState();
  const rtl = isRtlLanguage(family.language);
  const rtlText = rtl ? styles.rtlText : null;
  const tintTop = accentSoft ?? accent;

  return (
    <View style={styles.wrapper}>
      <View
        pointerEvents="none"
        style={[styles.layerTop, { backgroundColor: tintTop }]}
      />
      <View
        pointerEvents="none"
        style={[styles.layerMid, { backgroundColor: accent, opacity: 0.18 }]}
      />
      <View
        pointerEvents="none"
        style={[styles.layerBottom, { backgroundColor: paletteBase.paperCream }]}
      />

      <View style={styles.content}>
        <View style={styles.headerTopRow}>
          <Text style={[styles.sparkles, rtlText]} accessibilityElementsHidden>
            {sparkles}
          </Text>
          {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
        </View>
        <Text style={[styles.title, rtlText]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, rtlText]} numberOfLines={3}>
            {subtitle}
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
    opacity: 0.55,
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
    color: paletteBase.ink,
    fontSize: 13,
    letterSpacing: 4,
    opacity: 0.55,
  },
  trailing: {
    marginLeft: 8,
  },
  title: {
    color: paletteBase.ink,
    fontFamily: typography.displayItalic,
    fontSize: 30,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 36,
    marginTop: 2,
  },
  subtitle: {
    color: paletteBase.inkSoft,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
