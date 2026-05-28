/**
 * SectionCard — Nara-style banner-card component for the UI redesign.
 *
 * Structure: colored banner (60px) + section title (italic serif) + "+" button
 * (child-accent colored) + body row + optional custom children + "View history" footer.
 *
 * Shared between the Home+Sleep agent and the Feed+Food agent. All interaction
 * is optional so the same component works for allergen sections (no "+" button,
 * custom body children) and for feed/food/sleep sections.
 *
 * Section accent colors match the lookbook CSS tokens exactly:
 *   sleep — light: #E2D5EE / dark: #5D3AAD → #321A6A
 *   feed  — light: #F6D7BD / dark: #B95A2C → #6B2A12
 *   food  — light: #D2E2BD / dark: #4F8B45 → #1F4A2D
 *   learn — light: #F2E2C7 / dark: #C9923C → #6A4818
 */

import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { useAppTheme } from '../theme/useAppTheme';
import { sectionAccents, typography } from '../theme';

export type SectionType = 'sleep' | 'feed' | 'food' | 'learn';

type Props = {
  sectionType: SectionType;
  title: string;
  /** Pass to show the circular "+" button in the banner. Omit to hide it. */
  onPlusPress?: () => void;
  /** Accent color for the "+" button (defaults to palette primary). */
  plusAccentColor?: string;
  /** Accessibility label for the "+" button (defaults to "Add <title>"). */
  plusAccessibilityLabel?: string;
  iconEmoji?: string;
  /** Top small-caps label */
  label?: string;
  /** Main italic-serif value */
  value?: string;
  /** Right-side italic value */
  rightLabel?: string;
  /** Right-side caption under rightLabel */
  rightSublabel?: string;
  /** "View history" / "הצגת היסטוריה" footer link */
  footerLabel?: string;
  onFooterPress?: () => void;
  /** When true the banner is rendered at 44px height (compact) */
  compact?: boolean;
  /** Optional children replace the body row entirely */
  children?: ReactNode;
  testID?: string;
};

export function SectionCard({
  sectionType,
  title,
  onPlusPress,
  plusAccentColor,
  plusAccessibilityLabel,
  iconEmoji,
  label,
  value,
  rightLabel,
  rightSublabel,
  footerLabel,
  onFooterPress,
  compact = false,
  children,
  testID,
}: Props) {
  const theme = useAppTheme();
  const { family } = usePrototypeState();
  const rtl = isRtlLanguage(family.language);
  const rtlText = rtl ? styles.rtlText : null;

  const accents = sectionAccents[sectionType];
  const bannerBg = theme.isDark
    ? accents.dark.from   // gradient start used as solid fallback
    : accents.light.bg;
  const bannerTextColor = theme.isDark ? accents.dark.text : accents.light.ink;
  // "+" button uses a child-accent color if provided, otherwise default accent
  const plusBg = plusAccentColor ?? (theme.isDark ? '#C8A0FF' : '#4F89BC');

  return (
    <View
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
      testID={testID}
    >
      {/* Banner */}
      <View
        style={[
          styles.banner,
          compact ? styles.bannerCompact : null,
          { backgroundColor: bannerBg },
        ]}
      >
        <View style={styles.bannerLeft}>
          {iconEmoji ? (
            <Text style={styles.bannerEmoji}>{iconEmoji}</Text>
          ) : null}
          <Text style={[styles.bannerTitle, rtlText, { color: bannerTextColor }]}>{title}</Text>
        </View>
        {onPlusPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={plusAccessibilityLabel ?? `Add ${title}`}
            onPress={onPlusPress}
            style={[styles.plusButton, { backgroundColor: bannerTextColor }]}
          >
            <Text style={[styles.plusText, { color: bannerBg }]}>+</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Body */}
      {children ? (
        <View style={styles.body}>{children}</View>
      ) : label || value ? (
        <View style={[styles.bodyRow, rtl ? styles.bodyRowRtl : null]}>
          <View style={styles.bodyLeft}>
            {label ? (
              <Text style={[styles.bodyLabel, rtlText, { color: theme.mutedText }]}>{label}</Text>
            ) : null}
            {value ? (
              <Text style={[styles.bodyValue, rtlText, { color: theme.text }]}>{value}</Text>
            ) : null}
          </View>
          {rightLabel ? (
            <View style={[styles.bodyRight, rtl ? null : styles.bodyRightLtr]}>
              <Text style={[styles.bodyRightLabel, rtlText, { color: theme.text }]}>
                {rightLabel}
              </Text>
              {rightSublabel ? (
                <Text style={[styles.bodyRightSublabel, rtlText, { color: theme.mutedText }]}>
                  {rightSublabel}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Footer */}
      {footerLabel && onFooterPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onFooterPress}
          style={[styles.footer, rtl ? styles.footerRtl : null]}
        >
          <Text style={[styles.footerText, rtlText, { color: bannerTextColor }]}>
            {footerLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  banner: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerCompact: {
    minHeight: 44,
    paddingVertical: 8,
  },
  bannerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  bannerEmoji: {
    fontSize: 22,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  plusButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  plusText: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 28,
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bodyRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bodyRowRtl: {
    flexDirection: 'row-reverse',
  },
  bodyLeft: {
    flex: 1,
    gap: 4,
  },
  bodyLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  bodyValue: {
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 24,
  },
  bodyRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  bodyRightLtr: {
    alignItems: 'flex-end',
  },
  bodyRightLabel: {
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '700',
  },
  bodyRightSublabel: {
    fontSize: 13,
  },
  footer: {
    borderTopColor: 'rgba(0,0,0,0.06)',
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerRtl: {
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: 15,
    fontWeight: '700',
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
