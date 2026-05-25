import { useColorScheme } from 'react-native';
import { paletteBase } from './index';

export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return {
    isDark,
    background: isDark ? '#1F1A1A' : paletteBase.paperCream,
    text: isDark ? '#F4EFE9' : paletteBase.ink,
    mutedText: isDark ? '#B5ACA7' : paletteBase.inkSoft,
    surface: isDark ? '#2A2424' : paletteBase.cardWash,
    border: isDark ? '#3A3232' : paletteBase.border,
  };
}
