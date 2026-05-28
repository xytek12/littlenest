import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text } from 'react-native';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { useAppTheme } from '../theme/useAppTheme';

type Props = {
  /** Override the default goBack() handler. When provided the button is
   *  always shown (the canGoBack() guard is skipped). */
  onPress?: () => void;
};

export function HistoryBackButton({ onPress }: Props) {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const { family } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;

  if (!onPress && !navigation.canGoBack()) {
    return null;
  }

  const handlePress = onPress ?? (() => navigation.goBack());

  return (
    <Pressable
      accessibilityLabel={dictionary.common.close}
      accessibilityRole="button"
      onPress={handlePress}
      style={[styles.button, { borderColor: theme.border }]}
    >
      <Text style={[styles.text, rtlText, { color: theme.text }]}>← {dictionary.common.close}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '900',
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
