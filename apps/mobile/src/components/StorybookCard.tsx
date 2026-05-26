import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { paletteBase, typography } from '../theme';
import { useAppTheme } from '../theme/useAppTheme';

type Tone = 'paper' | 'whisper';

type Action = {
  label: string;
  onPress?: () => void;
  /** When true, the pill renders in a disabled style and ignores taps. */
  disabled?: boolean;
  accessibilityLabel?: string;
};

type Props = {
  /** Small uppercase tag at the top, e.g. "SLEEP", "NURSING", "WHISPER". */
  kicker: string;
  /** Main status line, e.g. "Maya is dreaming · 42 min". */
  title?: string;
  /** Optional secondary text shown under the title. */
  subtitle?: string;
  /** Free-form children rendered under subtitle (e.g. timers, segmented controls). */
  children?: ReactNode;
  /** Primary action — rendered as a small dark pill at the bottom-start. */
  primaryAction?: Action;
  /** Optional secondary action — rendered as an outlined pill next to primary. */
  secondaryAction?: Action;
  /**
   * "paper" — white-cream card (the SLEEP / NURSING cards in the Magical
   * Storybook lookbook).
   * "whisper" — tinted card with italic copy (the WHISPER card).
   */
  tone?: Tone;
  /** Accent override (used by whisper tone for the tinted background). */
  accent?: string;
  accentSoft?: string;
  testID?: string;
};

/**
 * Magical-Storybook-style card used on Sleep, Nursing, and Allergen screens.
 *
 * Replaces the old ActionCard layout on those screens with a kicker / status /
 * pill-button arrangement that matches the lookbook's "Once upon a routine"
 * cards. Other screens keep the existing ActionCard look.
 */
export function StorybookCard({
  kicker,
  title,
  subtitle,
  children,
  primaryAction,
  secondaryAction,
  tone = 'paper',
  accent,
  accentSoft,
  testID,
}: Props) {
  const theme = useAppTheme();
  const { family } = usePrototypeState();
  const rtl = isRtlLanguage(family.language);
  const rtlText = rtl ? styles.rtlText : null;
  const isWhisper = tone === 'whisper';

  // Whisper cards use a soft tint of the active accent. Paper cards use the
  // theme surface so they stay legible in both light and dark mode.
  const backgroundColor = isWhisper
    ? accentSoft ?? theme.surface
    : theme.surface;
  const borderColor = isWhisper
    ? accent ?? theme.border
    : theme.border;
  const kickerColor = isWhisper ? accent ?? theme.text : theme.mutedText;
  const titleStyle = isWhisper ? styles.titleWhisper : styles.titlePaper;

  return (
    <View
      style={[styles.card, { backgroundColor, borderColor }]}
      testID={testID}
    >
      <Text style={[styles.kicker, rtlText, { color: kickerColor }]}>
        {kicker.toUpperCase()}
      </Text>

      {title ? (
        <Text style={[titleStyle, rtlText, { color: theme.text }]}>{title}</Text>
      ) : null}

      {subtitle ? (
        <Text style={[styles.subtitle, rtlText, { color: theme.mutedText }]}>{subtitle}</Text>
      ) : null}

      {children ? <View style={styles.body}>{children}</View> : null}

      {primaryAction || secondaryAction ? (
        <View style={[styles.actionRow, rtl ? styles.actionRowRtl : null]}>
          {primaryAction ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={primaryAction.accessibilityLabel ?? primaryAction.label}
              accessibilityState={{ disabled: !!primaryAction.disabled }}
              disabled={primaryAction.disabled}
              onPress={primaryAction.onPress}
              style={[
                styles.pill,
                styles.pillPrimary,
                primaryAction.disabled ? styles.pillDisabled : null,
              ]}
            >
              <Text style={styles.pillPrimaryText}>{primaryAction.label}</Text>
            </Pressable>
          ) : null}
          {secondaryAction ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={secondaryAction.accessibilityLabel ?? secondaryAction.label}
              accessibilityState={{ disabled: !!secondaryAction.disabled }}
              disabled={secondaryAction.disabled}
              onPress={secondaryAction.onPress}
              style={[
                styles.pill,
                styles.pillSecondary,
                { borderColor: theme.border },
                secondaryAction.disabled ? styles.pillDisabled : null,
              ]}
            >
              <Text style={[styles.pillSecondaryText, { color: theme.text }]}>
                {secondaryAction.label}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 12,
    padding: 18,
  },
  kicker: {
    fontFamily: typography.bodyBlack,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  titlePaper: {
    fontFamily: typography.displayBold,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
    marginTop: 6,
  },
  titleWhisper: {
    fontFamily: typography.displayItalic,
    fontSize: 17,
    fontStyle: 'italic',
    lineHeight: 24,
    marginTop: 6,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  body: {
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionRowRtl: {
    flexDirection: 'row-reverse',
  },
  pill: {
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  pillPrimary: {
    backgroundColor: paletteBase.stickerCharcoal,
  },
  pillPrimaryText: {
    color: '#FFFCF7',
    fontFamily: typography.displayItalic,
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '700',
  },
  pillSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  pillSecondaryText: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    fontWeight: '700',
  },
  pillDisabled: {
    opacity: 0.45,
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
