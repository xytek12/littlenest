import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RootTabParamList } from '../navigation/RootNavigator';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { getPalette, paletteBase, typography } from '../theme';
import { useAppTheme } from '../theme/useAppTheme';
import { WatercolorHeader } from './WatercolorHeader';

type Props = {
  title: string;
  subtitle?: string;
  storybookTitle?: string;
};

export function FlowHeader({ title, subtitle, storybookTitle }: Props) {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const theme = useAppTheme();
  const { family, activeChild } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const palette = getPalette(
    family.mode === 'twins'
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: activeChild.sex },
  );

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel={dictionary.common.backHomeLabel}
        accessibilityRole="button"
        onPress={() => navigation.navigate('Home')}
        style={[styles.backButton, { borderColor: paletteBase.stickerCharcoal, backgroundColor: theme.surface }]}
      >
        <Text style={[styles.backText, rtlText, { color: paletteBase.stickerCharcoal }]}>
          {dictionary.common.backHome}
        </Text>
      </Pressable>
      <WatercolorHeader
        title={storybookTitle ?? title}
        subtitle={subtitle}
        accent={palette.primary}
        accentSoft={palette.primarySoft}
      />
      {storybookTitle ? (
        // Plain text title is kept so tests / accessibility tools that look
        // for the literal screen name can still find it (the storybook title
        // is decorative).
        <Text style={styles.plainTitle}>
          {title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 2,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backText: {
    fontFamily: typography.bodyBlack,
    fontSize: 13,
    fontWeight: '900',
  },
  plainTitle: {
    // visually hidden but discoverable for testing/a11y string queries
    height: 0,
    opacity: 0,
    overflow: 'hidden',
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
